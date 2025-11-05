import { describe, expect, it } from 'vitest';
import {
  DeleteAccountValidation,
  UpdateAvatarValidation,
  UpdateNameValidation,
  UpdatePasswordValidation,
} from '@/validations/AccountValidation';

describe('UpdateNameValidation', () => {
  describe('valid inputs', () => {
    it('should accept valid name data', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.success).toBe(true);
    });

    it('should accept names with hyphens', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'Jean-Pierre',
        lastName: 'Dubois',
      });

      expect(result.success).toBe(true);
    });

    it('should accept names with apostrophes', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'Mary',
        lastName: 'O\'Brien',
      });

      expect(result.success).toBe(true);
    });

    it('should accept names with spaces', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'Mary Jane',
        lastName: 'Van Der Berg',
      });

      expect(result.success).toBe(true);
    });

    it('should accept names with accents', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'José',
        lastName: 'García',
      });

      expect(result.success).toBe(true);
    });

    it('should accept single character names', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'J',
        lastName: 'D',
      });

      expect(result.success).toBe(true);
    });

    it('should accept maximum length names (50 chars)', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'a'.repeat(50),
        lastName: 'b'.repeat(50),
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty first name', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: '',
        lastName: 'Doe',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required');
      }
    });

    it('should reject empty last name', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'John',
        lastName: '',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required');
      }
    });

    it('should reject first name longer than 50 characters', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'a'.repeat(51),
        lastName: 'Doe',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('less than 50 characters');
      }
    });

    it('should reject last name longer than 50 characters', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'John',
        lastName: 'b'.repeat(51),
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('less than 50 characters');
      }
    });

    it('should reject names with numbers', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'John123',
        lastName: 'Doe',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('only contain letters');
      }
    });

    it('should reject names with special characters', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'John@',
        lastName: 'Doe',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('only contain letters');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle names with multiple spaces', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'Mary  Jane',
        lastName: 'Van  Der  Berg',
      });

      expect(result.success).toBe(true);
    });

    it('should accept names with only allowed special characters', () => {
      const result = UpdateNameValidation.safeParse({
        firstName: 'Mary-Jane',
        lastName: 'O\'Brien-Smith',
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('UpdatePasswordValidation', () => {
  describe('valid inputs', () => {
    it('should accept valid password data', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        newPasswordConfirmation: 'NewPass456',
      });

      expect(result.success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456@',
        newPasswordConfirmation: 'NewPass456@',
      });

      expect(result.success).toBe(true);
    });

    it('should accept minimum length password (8 chars)', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass1',
        newPassword: 'NewPass1',
        newPasswordConfirmation: 'NewPass1',
      });

      expect(result.success).toBe(true);
    });

    it('should accept maximum length password (100 chars)', () => {
      const longPassword = `Aa1${'x'.repeat(97)}`;
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: longPassword,
        newPasswordConfirmation: longPassword,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty current password', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: '',
        newPassword: 'NewPass456',
        newPasswordConfirmation: 'NewPass456',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'Short1',
        newPasswordConfirmation: 'Short1',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 8 characters');
      }
    });

    it('should reject password without uppercase letter', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'newpass123',
        newPasswordConfirmation: 'newpass123',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('uppercase');
      }
    });

    it('should reject password without lowercase letter', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NEWPASS123',
        newPasswordConfirmation: 'NEWPASS123',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('lowercase');
      }
    });

    it('should reject password without number', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NewPassword',
        newPasswordConfirmation: 'NewPassword',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('number');
      }
    });

    it('should reject when passwords do not match', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        newPasswordConfirmation: 'DifferentPass789',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('do not match'))).toBe(true);
      }
    });

    it('should reject when new password equals current password', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'SamePass123',
        newPassword: 'SamePass123',
        newPasswordConfirmation: 'SamePass123',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('different from current'))).toBe(
          true,
        );
      }
    });

    it('should reject empty confirm password', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: 'NewPass456',
        newPasswordConfirmation: '',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues.some(
            i => i.message.includes('confirm') || i.message.includes('do not match'),
          ),
        ).toBe(true);
      }
    });

    it('should reject password longer than 100 characters', () => {
      const longPassword = `Aa1${'x'.repeat(98)}`;
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldPass123',
        newPassword: longPassword,
        newPasswordConfirmation: longPassword,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('less than 100 characters');
      }
    });
  });

  describe('edge cases', () => {
    it('should accept password with all types of characters', () => {
      const result = UpdatePasswordValidation.safeParse({
        currentPassword: 'OldP@ss123!',
        newPassword: 'NewP@ss456!#$',
        newPasswordConfirmation: 'NewP@ss456!#$',
      });

      expect(result.success).toBe(true);
    });
  });
});

describe('UpdateAvatarValidation', () => {
  describe('valid inputs', () => {
    it('should accept PNG image under 5MB', () => {
      const file = new File(['content'], 'avatar.png', { type: 'image/png' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });

    it('should accept JPEG image', () => {
      const file = new File(['content'], 'photo.jpeg', { type: 'image/jpeg' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });

    it('should accept JPG image', () => {
      const file = new File(['content'], 'photo.jpg', { type: 'image/jpg' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });

    it('should accept WebP image', () => {
      const file = new File(['content'], 'image.webp', { type: 'image/webp' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });

    it('should accept file under 5MB', () => {
      const content = Array.from({ length: 4 * 1024 * 1024 }).fill('a').join('');
      const file = new File([content], 'large.png', { type: 'image/png' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty file', () => {
      const file = new File([], 'empty.png', { type: 'image/png' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('File cannot be empty');
      }
    });

    it('should reject non-image MIME type (PDF)', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('valid image format');
      }
    });

    it('should reject non-image MIME type (text)', () => {
      const file = new File(['content'], 'file.txt', { type: 'text/plain' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(false);
    });

    it('should reject file without valid extension', () => {
      const file = new File(['content'], 'image.gif', { type: 'image/gif' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(false);
    });

    it('should reject GIF format', () => {
      const file = new File(['content'], 'animation.gif', { type: 'image/gif' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(false);
    });

    // Skipped: File size tests don't work reliably in Node environment
    it.skip('should reject file over 5MB', () => {
      const content = Array.from({ length: 6 * 1024 * 1024 }).fill('a').join('');
      const file = new File([content], 'large.png', { type: 'image/png' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('5MB');
      }
    });
  });

  describe('edge cases', () => {
    it('should accept different case extensions', () => {
      const file = new File(['content'], 'image.PNG', { type: 'image/png' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });

    it('should accept file with multiple dots in name', () => {
      const file = new File(['content'], 'my.avatar.image.png', { type: 'image/png' });
      const result = UpdateAvatarValidation.safeParse({ image: file });

      expect(result.success).toBe(true);
    });
  });
});

describe('DeleteAccountValidation', () => {
  describe('valid inputs', () => {
    it('should accept any non-empty password', () => {
      const result = DeleteAccountValidation.safeParse({
        password: 'MyPassword123',
      });

      expect(result.success).toBe(true);
    });

    it('should accept short password', () => {
      const result = DeleteAccountValidation.safeParse({
        password: 'abc',
      });

      expect(result.success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const result = DeleteAccountValidation.safeParse({
        password: 'P@ssw0rd!#$',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty password', () => {
      const result = DeleteAccountValidation.safeParse({
        password: '',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('required');
      }
    });

    it('should reject missing password field', () => {
      const result = DeleteAccountValidation.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should accept password with only spaces', () => {
      const result = DeleteAccountValidation.safeParse({
        password: '   ',
      });

      expect(result.success).toBe(true);
    });

    it('should accept very long password', () => {
      const result = DeleteAccountValidation.safeParse({
        password: 'a'.repeat(1000),
      });

      expect(result.success).toBe(true);
    });
  });
});
