import { describe, expect, it } from 'vitest';
import { SignUpValidation } from '@/validations/SignUpValidation';

describe('Sign-Up Form Validation', () => {
  describe('valid form data', () => {
    it('should pass validation with all required fields', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.password).toBe('password123');
        expect(result.data.passwordConfirmation).toBe('password123');
      }
    });

    it('should pass validation with profile image', () => {
      const imageFile = new File(['dummy content'], 'profile.png', { type: 'image/png' });
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'securepass',
        passwordConfirmation: 'securepass',
        image: imageFile,
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.image).toBeInstanceOf(File);
        expect(result.data.image?.name).toBe('profile.png');
      }
    });

    it('should pass validation without profile image', () => {
      const validData = {
        firstName: 'Max',
        lastName: 'Robinson',
        email: 'max@example.com',
        password: 'mypassword',
        passwordConfirmation: 'mypassword',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.image).toBeUndefined();
      }
    });

    it('should pass validation with exactly 8 character password', () => {
      const validData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: '12345678',
        passwordConfirmation: '12345678',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('firstName validation', () => {
    it('should fail validation with empty first name', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        const firstNameError = result.error.issues.find(issue => issue.path[0] === 'firstName');

        expect(firstNameError?.message).toBe('First name is required');
      }
    });

    it('should fail validation with missing first name', () => {
      const invalidData = {
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation with single character first name', () => {
      const validData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('lastName validation', () => {
    it('should fail validation with empty last name', () => {
      const invalidData = {
        firstName: 'John',
        lastName: '',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        const lastNameError = result.error.issues.find(issue => issue.path[0] === 'lastName');

        expect(lastNameError?.message).toBe('Last name is required');
      }
    });

    it('should fail validation with missing last name', () => {
      const invalidData = {
        firstName: 'John',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation with single character last name', () => {
      const validData = {
        firstName: 'John',
        lastName: 'D',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('email validation', () => {
    it('should fail validation with invalid email format', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'notanemail',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        const emailError = result.error.issues.find(issue => issue.path[0] === 'email');

        expect(emailError?.message).toBe('Please enter a valid email address');
      }
    });

    it('should fail validation with email missing @ symbol', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'userexample.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation with empty email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should fail validation with password less than 8 characters', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'short',
        passwordConfirmation: 'short',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        const passwordError = result.error.issues.find(issue => issue.path[0] === 'password');

        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('should fail validation with 7 character password', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: '1234567',
        passwordConfirmation: '1234567',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation with empty password', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: '',
        passwordConfirmation: '',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('password confirmation validation', () => {
    it('should fail validation when passwords don\'t match', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'differentpassword',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        const confirmError = result.error.issues.find(
          issue => issue.path[0] === 'passwordConfirmation',
        );

        expect(confirmError?.message).toBe('Passwords don\'t match');
      }
    });

    it('should fail validation when password confirmation is empty', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: '',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation when password confirmation is missing', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation when passwords match exactly', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'MySecurePass123!',
        passwordConfirmation: 'MySecurePass123!',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('image validation', () => {
    it('should fail validation with non-File image value', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        image: 'not-a-file',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation with different image file types', () => {
      const jpgFile = new File(['jpg content'], 'profile.jpg', { type: 'image/jpeg' });
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        image: jpgFile,
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.image?.name).toBe('profile.jpg');
        expect(result.data.image?.type).toBe('image/jpeg');
      }
    });
  });

  describe('multiple validation errors', () => {
    it('should fail validation with multiple invalid fields', () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        password: 'short',
        passwordConfirmation: 'different',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
      }
    });

    it('should fail validation with all fields empty', () => {
      const invalidData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirmation: '',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
      }
    });
  });
});
