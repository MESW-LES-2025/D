import { describe, expect, it } from 'vitest';
import { SignInValidation } from '@/validations/SignInValidation';

describe('Sign-In Form Validation', () => {
  describe('valid form data', () => {
    it('should pass validation with valid email, password, and rememberMe', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: true,
      };

      const result = SignInValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('password123');
        expect(result.data.rememberMe).toBe(true);
      }
    });

    it('should pass validation with rememberMe set to false', () => {
      const validData = {
        email: 'john.doe@example.com',
        password: 'securepass',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.rememberMe).toBe(false);
      }
    });

    it('should pass validation with exactly 8 character password', () => {
      const validData = {
        email: 'test@test.com',
        password: '12345678',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.password).toBe('12345678');
      }
    });

    it('should pass validation with long password', () => {
      const validData = {
        email: 'user@example.com',
        password: 'verylongandsecurepassword123456789',
        rememberMe: true,
      };

      const result = SignInValidation.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should fail validation with invalid email format', () => {
      const invalidData = {
        email: 'notanemail',
        password: 'password123',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Please enter a valid email address');
        expect(result.error.issues[0]?.path[0]).toBe('email');
      }
    });

    it('should fail validation with email missing @ symbol', () => {
      const invalidData = {
        email: 'userexample.com',
        password: 'password123',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation with email missing domain', () => {
      const invalidData = {
        email: 'user@',
        password: 'password123',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation with empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should fail validation with password less than 8 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'pass',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Password must be at least 8 characters');
        expect(result.error.issues[0]?.path[0]).toBe('password');
      }
    });

    it('should fail validation with 7 character password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '1234567',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation with empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('rememberMe validation', () => {
    it('should fail validation when rememberMe is missing', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation when rememberMe is not a boolean', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'password123',
        rememberMe: 'true', // string instead of boolean
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('multiple validation errors', () => {
    it('should fail validation with multiple invalid fields', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'short',
        rememberMe: false,
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should fail validation with all invalid fields', () => {
      const invalidData = {
        email: '',
        password: '',
        rememberMe: 'not-boolean',
      };

      const result = SignInValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
