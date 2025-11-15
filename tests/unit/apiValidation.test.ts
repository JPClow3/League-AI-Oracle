import { describe, it, expect } from 'vitest';
import {
  AIAdviceSchema,
  BotDraftActionSchema,
  TeamBuilderSuggestionSchema,
  TrialQuestionSchema,
  validateResponse,
  safeValidateResponse,
} from '../../lib/apiValidation';

describe('API Validation', () => {
  describe('AIAdviceSchema', () => {
    it('should validate correct AI advice structure', () => {
      const validAdvice = {
        teamAnalysis: {
          blue: {
            draftScore: 'A',
            strengths: ['Strong early game'],
            weaknesses: [],
            winCondition: 'Win early',
          },
          red: {
            draftScore: 'B',
            strengths: [],
            weaknesses: [],
            winCondition: 'Scale',
          },
        },
        headToHead: {
          summary: 'Blue team favored',
        },
      };

      const result = validateResponse(validAdvice, AIAdviceSchema);
      expect(result).toEqual(validAdvice);
    });

    it('should reject invalid structure', () => {
      const invalidAdvice = {
        teamAnalysis: {
          blue: {},
        },
      };

      expect(() => {
        validateResponse(invalidAdvice, AIAdviceSchema);
      }).toThrow();
    });
  });

  describe('BotDraftActionSchema', () => {
    it('should validate bot draft action', () => {
      const validAction = {
        championName: 'Ahri',
        reasoning: 'Strong mid laner',
      };

      const result = validateResponse(validAction, BotDraftActionSchema);
      expect(result).toEqual(validAction);
    });

    it('should reject missing championName', () => {
      const invalidAction = {
        reasoning: 'Some reason',
      };

      expect(() => {
        validateResponse(invalidAction, BotDraftActionSchema);
      }).toThrow();
    });
  });

  describe('TeamBuilderSuggestionSchema', () => {
    it('should validate team builder suggestions array', () => {
      const validSuggestions = [
        { championName: 'Ahri', reasoning: 'Good synergy' },
        { championName: 'Jinx', reasoning: 'Strong ADC' },
      ];

      const result = validateResponse(validSuggestions, TeamBuilderSuggestionSchema);
      expect(result).toEqual(validSuggestions);
    });
  });

  describe('TrialQuestionSchema', () => {
    it('should validate trial question', () => {
      const validQuestion = {
        question: 'What is the best strategy?',
        options: ['Option A', 'Option B', 'Option C'],
        correctAnswer: 'Option A',
        explanation: 'Because...',
      };

      const result = validateResponse(validQuestion, TrialQuestionSchema);
      expect(result).toEqual(validQuestion);
    });

    it('should reject invalid options count', () => {
      const invalidQuestion = {
        question: 'Test?',
        options: ['A', 'B'], // Should be 3
        correctAnswer: 'A',
        explanation: 'Test',
      };

      expect(() => {
        validateResponse(invalidQuestion, TrialQuestionSchema);
      }).toThrow();
    });
  });

  describe('safeValidateResponse', () => {
    it('should return success for valid data', () => {
      const validData = { championName: 'Ahri', reasoning: 'Test' };
      const result = safeValidateResponse(validData, BotDraftActionSchema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should return error for invalid data', () => {
      const invalidData = { reasoning: 'Test' };
      const result = safeValidateResponse(invalidData, BotDraftActionSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
