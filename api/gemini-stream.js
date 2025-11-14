/**
 * Vercel Serverless Function - Gemini API Streaming Proxy
 * Provides Server-Sent Events (SSE) streaming for real-time AI responses
 */

import { rateLimitMiddleware } from './rateLimit.js';
import { validateRequest, geminiRequestSchema, sanitizeString } from './validation.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const allowed = await rateLimitMiddleware(req, res);
  if (!allowed) {
    return; // Response already sent by middleware
  }

  try {
    // ✅ SECURITY: Validate request with Zod
    const validation = validateRequest(req.body, geminiRequestSchema);

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error,
        details: validation.details,
      });
    }

    const { prompt, model, useSearch } = validation.data;

    // Sanitize prompt (remove control characters)
    const sanitizedPrompt = sanitizeString(prompt);

    // Get API key from environment
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Call Gemini API with streaming
    // ✅ SECURITY FIX: API key in header, not URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;

    const requestBody = {
      contents: [{ parts: [{ text: sanitizedPrompt }] }],
      generationConfig: {},
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    };

    // ✅ IMPROVEMENT: Add AbortSignal support with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for streaming

    // Handle client disconnect
    req.on('close', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY, // ✅ Use header instead of URL param
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error:', response.status, errorData);

        if (response.status === 429) {
          res.write(
            `data: ${JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.', type: 'rate_limit' })}\n\n`
          );
          return res.end();
        }

        if (response.status === 403) {
          res.write(
            `data: ${JSON.stringify({ error: 'AI service temporarily unavailable. Please try again in a few minutes.', type: 'quota_exceeded' })}\n\n`
          );
          return res.end();
        }

        res.write(`data: ${JSON.stringify({ error: 'AI service error' })}\n\n`);
        return res.end();
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError.name === 'AbortError') {
        console.error('Streaming request aborted or timed out');
        res.write(`data: ${JSON.stringify({ error: 'Request timeout or cancelled', type: 'timeout' })}\n\n`);
        return res.end();
      }

      throw fetchError;
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Send completion event
          res.write('data: [DONE]\n\n');
          res.end();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim()) {
              try {
                const data = JSON.parse(jsonStr);
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                  // Send text chunk to client
                  res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }

                // Handle grounding metadata if present
                const groundingMetadata = data.candidates?.[0]?.groundingMetadata;
                if (groundingMetadata) {
                  res.write(`data: ${JSON.stringify({ groundingMetadata })}\n\n`);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Stream error:', streamError);
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Gemini Streaming API Error:', error.message);

    // Try to send error through SSE if headers not sent yet
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
    }

    res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
    res.end();
  }
}
