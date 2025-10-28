import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidLength, isRequired, isValidChampionName, isValidTag } from '../../lib/validation';

describe('validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should invalidate incorrect email', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidLength', () => {
    it('should validate string within length bounds', () => {
      expect(isValidLength('hello', 1, 10)).toBe(true);
      expect(isValidLength('test', 4, 4)).toBe(true);
    });

    it('should invalidate string outside length bounds', () => {
      expect(isValidLength('hi', 3, 10)).toBe(false);
      expect(isValidLength('verylongstring', 1, 5)).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('should validate non-empty strings', () => {
      expect(isRequired('test')).toBe(true);
      expect(isRequired('  value  ')).toBe(true);
    });

    it('should invalidate empty or null values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('isValidChampionName', () => {
    it('should validate valid champion names', () => {
      expect(isValidChampionName('Ahri')).toBe(true);
      expect(isValidChampionName("Kai'Sa")).toBe(true);
      expect(isValidChampionName('Lee Sin')).toBe(true);
    });

    it('should invalidate invalid champion names', () => {
      expect(isValidChampionName('A')).toBe(false);
      expect(isValidChampionName('Champion123')).toBe(false);
      expect(isValidChampionName('Test<>')).toBe(false);
    });
  });

  describe('isValidTag', () => {
    it('should validate valid tags', () => {
      expect(isValidTag('teamfight')).toBe(true);
      expect(isValidTag('poke-comp')).toBe(true);
    });

    it('should invalidate invalid tags', () => {
      expect(isValidTag('')).toBe(false);
      expect(isValidTag('a'.repeat(25))).toBe(false);
      expect(isValidTag('tag<script>')).toBe(false);
    });
  });
});

