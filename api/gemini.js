/**
 * Vercel Serverless Function - Gemini API Proxy
 * This runs as a serverless function on Vercel
 */

import { rateLimitMiddleware } from './rateLimit.js';
import { validateRequest, geminiRequestSchema } from './validation.js';

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

    const { prompt, model, isJson, useSearch } = validation.data;

    // Get API key from environment
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Gemini API
    // ✅ SECURITY FIX: API key in header, not URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: isJson
        ? {
            responseMimeType: 'application/json',
          }
        : {},
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    };

    // ✅ IMPROVEMENT: Add AbortSignal support with timeout and client disconnect detection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Detect client disconnect (Vercel environment)
    req.on('close', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });

    try {
      const response = await fetch(url, {
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
          return res.status(429).json({
            error: 'Rate limit exceeded. Please try again in a moment.',
            type: 'rate_limit',
          });
        }

        if (response.status === 403) {
          return res.status(503).json({
            error: 'AI service temporarily unavailable. Please try again in a few minutes.',
            type: 'quota_exceeded',
          });
        }

        return res.status(500).json({ error: 'AI service error' });
      }

      const data = await response.json();

      // Extract text from Gemini response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        return res.status(500).json({ error: 'AI returned empty response' });
      }

      // Extract grounding metadata if available (for search grounding)
      const groundingMetadata = data.candidates?.[0]?.groundingMetadata;

      res.status(200).json({
        text,
        success: true,
        groundingMetadata: groundingMetadata || undefined,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout/abort errors
      if (fetchError.name === 'AbortError') {
        console.error('Request aborted or timed out');
        return res.status(408).json({
          error: 'Request timeout. The AI service took too long to respond.',
          type: 'timeout',
        });
      }

      throw fetchError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
