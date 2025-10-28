/**
 * Vercel Serverless Function - Gemini API Proxy
 * This runs as a serverless function on Vercel
 */

import { rateLimitMiddleware } from './rateLimit.js';

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
    const { prompt, model = 'gemini-2.5-flash', isJson = true, useSearch = false } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    // Validate model
    const validModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
    if (!validModels.includes(model)) {
      return res.status(400).json({ error: 'Invalid model' });
    }

    // Get API key from environment
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: isJson ? {
        responseMimeType: 'application/json'
      } : {},
      tools: useSearch ? [{ googleSearch: {} }] : undefined
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);

      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again in a moment.',
          type: 'rate_limit'
        });
      }

      if (response.status === 403 || response.status === 429) {
        return res.status(503).json({
          error: 'AI service temporarily unavailable. Please try again in a few minutes.',
          type: 'quota_exceeded'
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
      groundingMetadata: groundingMetadata || undefined
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

