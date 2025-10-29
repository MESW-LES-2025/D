import { describe, expect, it } from 'vitest';
import { CounterValidation } from '@/validations/CounterValidation';

describe('CounterValidation', () => {
  describe('when increment is valid', () => {
    it('should pass validation for increment value 1', () => {
      const result = CounterValidation.safeParse({ increment: 1 });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.increment).toBe(1);
      }
    });

    it('should pass validation for increment value 2', () => {
      const result = CounterValidation.safeParse({ increment: 2 });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.increment).toBe(2);
      }
    });

    it('should pass validation for increment value 3', () => {
      const result = CounterValidation.safeParse({ increment: 3 });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.increment).toBe(3);
      }
    });

    it('should convert string numbers to numbers', () => {
      const result = CounterValidation.safeParse({ increment: '2' });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.increment).toBe(2);
        expect(typeof result.data.increment).toBe('number');
      }
    });
  });

  describe('when increment is invalid', () => {
    it('should fail validation for increment value 0', () => {
      const result = CounterValidation.safeParse({ increment: 0 });

      expect(result.success).toBe(false);
    });

    it('should fail validation for increment value 4', () => {
      const result = CounterValidation.safeParse({ increment: 4 });

      expect(result.success).toBe(false);
    });

    it('should fail validation for negative numbers', () => {
      const result = CounterValidation.safeParse({ increment: -1 });

      expect(result.success).toBe(false);
    });

    it('should fail validation for non-numeric strings', () => {
      const result = CounterValidation.safeParse({ increment: 'abc' });

      expect(result.success).toBe(false);
    });

    it('should fail validation when increment is missing', () => {
      const result = CounterValidation.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      const result = CounterValidation.safeParse({ increment: null });

      expect(result.success).toBe(false);
    });

    it('should handle undefined values', () => {
      const result = CounterValidation.safeParse({ increment: undefined });

      expect(result.success).toBe(false);
    });
  });
});
