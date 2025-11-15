import { z } from 'zod';

/**
 * Zod schemas for validating API responses from Gemini
 * Ensures type safety and runtime validation
 */

// Champion Suggestion Schema
export const ChampionSuggestionSchema = z.object({
  championName: z.string().min(1),
  reasoning: z.string().max(200).optional(),
});

// Team Analysis Schema
export const TeamAnalysisSchema = z.object({
  draftScore: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  winCondition: z.string().optional(),
  powerSpikeTiming: z.string().optional(),
  recommendedBuild: z.string().optional(),
});

// Matchup Schema
export const MatchupSchema = z.object({
  championName: z.string(),
  tip: z.string().optional(),
  reasoning: z.string().optional(),
});

// AI Advice Schema
export const AIAdviceSchema = z.object({
  teamAnalysis: z.object({
    blue: TeamAnalysisSchema,
    red: TeamAnalysisSchema,
  }),
  headToHead: z
    .object({
      summary: z.string(),
      keyMatchups: z.array(MatchupSchema).optional(),
    })
    .optional(),
  buildSuggestions: z
    .array(
      z.object({
        championName: z.string(),
        build: z.string(),
        reasoning: z.string().optional(),
      })
    )
    .optional(),
});

// Bot Draft Action Schema
export const BotDraftActionSchema = z.object({
  championName: z.string().min(1),
  reasoning: z.string().max(200).optional(),
});

// Team Builder Suggestion Schema
export const TeamBuilderSuggestionSchema = z.array(ChampionSuggestionSchema);

// Trial Question Schema
export const TrialQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).length(3),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1),
});

// Meta Source Schema
export const MetaSourceSchema = z.object({
  title: z.string(),
  uri: z.string().url().or(z.literal('')),
});

// Grounded Answer Schema
export const GroundedAnswerSchema = z.object({
  text: z.string(),
  sources: z.array(MetaSourceSchema),
});

// Tier List Schema
export const TieredChampionSchema = z.object({
  championName: z.string(),
  reasoning: z.string().optional(),
});

export const RoleTierListSchema = z.object({
  role: z.string(),
  champions: z.array(TieredChampionSchema),
});

export const StructuredTierListSchema = z.object({
  summary: z.string(),
  tierList: z.array(RoleTierListSchema),
  sources: z.array(MetaSourceSchema),
});

// Patch Notes Schema
export const PatchChangeSchema = z.object({
  name: z.string(),
  change: z.string(),
});

export const StructuredPatchNotesSchema = z.object({
  summary: z.string(),
  buffs: z.array(PatchChangeSchema),
  nerfs: z.array(PatchChangeSchema),
  systemChanges: z.array(PatchChangeSchema),
  sources: z.array(MetaSourceSchema),
});

/**
 * Validate and parse API response with Zod schema
 * Throws ZodError if validation fails
 */
export function validateResponse<T>(data: unknown, schema: z.ZodSchema<T>): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns a result instead of throwing
 */
export function safeValidateResponse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
