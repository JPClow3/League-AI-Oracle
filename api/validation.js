/**
 * API Request Validation Schemas
 * Uses Zod for runtime type checking and validation
 */

import { z } from 'zod';

// ✅ SECURITY: Comprehensive validation for Gemini API requests
export const geminiRequestSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(10000, 'Prompt must not exceed 10,000 characters')
    .refine(val => val.trim().length > 0, 'Prompt cannot be empty or whitespace'),

  model: z.enum(['gemini-2.5-flash', 'gemini-2.5-pro']).optional().default('gemini-2.5-flash'),

  isJson: z.boolean().optional().default(true),

  useSearch: z.boolean().optional().default(false),
});

// Draft state validation schema
const championSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().optional(),
});

const teamSchema = z.object({
  bans: z.array(championSchema).max(5),
  picks: z.array(championSchema).max(5),
});

export const draftStateSchema = z.object({
  blue: teamSchema,
  red: teamSchema,
  currentPhase: z.string().optional(),
  currentTeam: z.enum(['blue', 'red']).optional(),
});

// Query validation for search/analysis endpoints
export const querySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters').max(500, 'Query must not exceed 500 characters'),

  draftState: draftStateSchema.optional(),

  context: z.string().max(2000, 'Context must not exceed 2,000 characters').optional(),
});

/**
 * Validate request body against a schema
 * @param {Object} body - Request body to validate
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Object} - { success: boolean, data?: any, error?: string }
 */
export function validateRequest(body, schema) {
  try {
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');

      return {
        success: false,
        error: `Validation error: ${errorMessages}`,
        details: error.errors,
      };
    }

    return {
      success: false,
      error: 'Invalid request format',
    };
  }
}

/**
 * Sanitize string input by removing control characters
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') {
    return '';
  }
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\x00-\x1F\x7F]/g, '').trim();
}
