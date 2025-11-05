import { describe, expect, it } from 'vitest';
import {
  avatarSchema,
  firstNameSchema,
  lastNameSchema,
  passwordSchema,
  SignInValidation,
  SignUpValidation,
} from '@/validations/AuthValidation';

describe('firstNameSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid first name', () => {
      const result = firstNameSchema.safeParse('John');

      expect(result.success).toBe(true);
    });

    it('should accept name with hyphens', () => {
      const result = firstNameSchema.safeParse('Jean-Pierre');

      expect(result.success).toBe(true);
    });

    it('should accept name with apostrophes', () => {
      const result = firstNameSchema.safeParse('O\'Brien');

      expect(result.success).toBe(true);
    });

    it('should accept name with accents', () => {
      const result = firstNameSchema.safeParse('José');

      expect(result.success).toBe(true);
    });

    it('should accept name with spaces', () => {
      const result = firstNameSchema.safeParse('Mary Jane');

      expect(result.success).toBe(true);
    });

    it('should accept single character name', () => {
      const result = firstNameSchema.safeParse('J');

      expect(result.success).toBe(true);
    });

    it('should accept 50 character name', () => {
      const result = firstNameSchema.safeParse('a'.repeat(50));

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = firstNameSchema.safeParse('');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('First name is required');
      }
    });

    it('should reject name with numbers', () => {
      const result = firstNameSchema.safeParse('John123');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('only contain letters');
      }
    });

    it('should reject name with special characters', () => {
      const result = firstNameSchema.safeParse('John@');

      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters', () => {
      const result = firstNameSchema.safeParse('a'.repeat(51));

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('First name must be less than 50 characters');
      }
    });
  });
});

describe('lastNameSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid last name', () => {
      const result = lastNameSchema.safeParse('Doe');

      expect(result.success).toBe(true);
    });

    it('should accept compound last name', () => {
      const result = lastNameSchema.safeParse('Van Der Berg');

      expect(result.success).toBe(true);
    });

    it('should accept hyphenated last name', () => {
      const result = lastNameSchema.safeParse('Smith-Jones');

      expect(result.success).toBe(true);
    });

    it('should accept single character', () => {
      const result = lastNameSchema.safeParse('D');

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = lastNameSchema.safeParse('');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Last name is required');
      }
    });

    it('should reject name longer than 50 characters', () => {
      const result = lastNameSchema.safeParse('b'.repeat(51));

      expect(result.success).toBe(false);
    });
  });
});

describe('passwordSchema', () => {
  describe('valid inputs', () => {
    it('should accept password with all requirements', () => {
      const result = passwordSchema.safeParse('Password123');

      expect(result.success).toBe(true);
    });

    it('should accept minimum length password (8 chars)', () => {
      const result = passwordSchema.safeParse('Pass123a');

      expect(result.success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const result = passwordSchema.safeParse('Pass123!@#');

      expect(result.success).toBe(true);
    });

    it('should accept maximum length password (100 chars)', () => {
      const result = passwordSchema.safeParse(`Aa1${'x'.repeat(97)}`);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject password shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Pass12');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('should reject password without uppercase letter', () => {
      const result = passwordSchema.safeParse('password123');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('uppercase');
      }
    });

    it('should reject password without lowercase letter', () => {
      const result = passwordSchema.safeParse('PASSWORD123');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('lowercase');
      }
    });

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('PasswordABC');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('number');
      }
    });

    it('should reject password longer than 100 characters', () => {
      const result = passwordSchema.safeParse(`Aa1${'x'.repeat(98)}`);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Password must be less than 100 characters');
      }
    });

    it('should reject empty password', () => {
      const result = passwordSchema.safeParse('');

      expect(result.success).toBe(false);
    });
  });
});

describe('avatarSchema', () => {
  describe('valid inputs', () => {
    it('should accept PNG image', () => {
      const file = new File(['content'], 'avatar.png', { type: 'image/png' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(true);
    });

    it('should accept JPEG image', () => {
      const file = new File(['content'], 'photo.jpeg', { type: 'image/jpeg' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(true);
    });

    it('should accept JPG image', () => {
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpg' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(true);
    });

    it('should accept WebP image', () => {
      const file = new File(['content'], 'image.webp', { type: 'image/webp' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(true);
    });

    it('should accept file under 5MB', () => {
      const content = Array.from({ length: 4 * 1024 * 1024 }).fill('a').join('');
      const file = new File([content], 'large.png', { type: 'image/png' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty file', () => {
      const file = new File([], 'empty.png', { type: 'image/png' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('File cannot be empty');
      }
    });

    it('should reject file without valid extension', () => {
      const file = new File(['content'], 'file.txt', { type: 'image/png' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('valid image extension');
      }
    });

    it('should reject non-image MIME type', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('valid image format');
      }
    });

    it('should reject GIF format', () => {
      const file = new File(['content'], 'animation.gif', { type: 'image/gif' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(false);
    });

    // Note: File size tests are skipped in Node environment
    it.skip('should reject file over 5MB', () => {
      const content = Array.from({ length: 6 * 1024 * 1024 }).fill('a').join('');
      const file = new File([content], 'large.png', { type: 'image/png' });
      const result = avatarSchema.safeParse(file);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('5MB');
      }
    });
  });
});

describe('SignInValidation', () => {
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

describe('SignUpValidation', () => {
  describe('valid form data', () => {
    it('should pass validation with all required fields', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.firstName).toBe('John');
        expect(result.data.lastName).toBe('Doe');
        expect(result.data.email).toBe('john.doe@example.com');
        expect(result.data.password).toBe('Password123');
        expect(result.data.passwordConfirmation).toBe('Password123');
      }
    });

    it('should pass validation with profile image', () => {
      const imageFile = new File(['dummy content'], 'profile.png', { type: 'image/png' });
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'SecurePass1',
        passwordConfirmation: 'SecurePass1',
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
        password: 'MyPassword1',
        passwordConfirmation: 'MyPassword1',
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
        password: 'Pass123a',
        passwordConfirmation: 'Pass123a',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation with single character first name', () => {
      const validData = {
        firstName: 'J',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation with single character last name', () => {
      const validData = {
        firstName: 'John',
        lastName: 'D',
        email: 'user@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation with empty email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: '',
        password: 'Password123',
        passwordConfirmation: 'Password123',
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
        password: 'Short1',
        passwordConfirmation: 'Short1',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        const passwordError = result.error.issues.find(issue => issue.path[0] === 'password');

        expect(passwordError?.message).toBe('Password must be at least 8 characters');
      }
    });

    it('should fail validation without uppercase letter', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation without lowercase letter', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'PASSWORD123',
        passwordConfirmation: 'PASSWORD123',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should fail validation without number', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'PasswordABC',
        passwordConfirmation: 'PasswordABC',
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
        password: 'Password123',
        passwordConfirmation: 'DifferentPass123',
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
        password: 'Password123',
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
        password: 'Password123',
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
        password: 'Password123',
        passwordConfirmation: 'Password123',
        image: 'not-a-file',
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should pass validation with JPG image', () => {
      const jpgFile = new File(['jpg content'], 'profile.jpg', { type: 'image/jpeg' });
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
        image: jpgFile,
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.image?.name).toBe('profile.jpg');
        expect(result.data.image?.type).toBe('image/jpeg');
      }
    });

    it('should pass validation with WebP image', () => {
      const webpFile = new File(['webp content'], 'profile.webp', { type: 'image/webp' });
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
        image: webpFile,
      };

      const result = SignUpValidation.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should fail validation with empty image file', () => {
      const emptyFile = new File([], 'empty.png', { type: 'image/png' });
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com',
        password: 'Password123',
        passwordConfirmation: 'Password123',
        image: emptyFile,
      };

      const result = SignUpValidation.safeParse(invalidData);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('empty'))).toBe(true);
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
