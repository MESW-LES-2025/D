import { describe, expect, it } from 'vitest';
import { TaskValidation } from '@/validations/TaskValidation';

describe('TaskValidation', () => {
  describe('when task data is valid', () => {
    it('should pass validation with all required fields', () => {
      const result = TaskValidation.safeParse({
        name: 'Test Task',
        description: 'Test description',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe('Test Task');
        expect(result.data.description).toBe('Test description');
        expect(result.data.priority).toBe('medium');
        expect(result.data.difficulty).toBe('medium');
      }
    });

    it('should pass validation with empty description', () => {
      const result = TaskValidation.safeParse({
        name: 'Test Task',
        description: '',
        priority: 'low',
        difficulty: 'easy',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.description).toBe('');
      }
    });

    it('should pass validation with optional dueDate', () => {
      const dueDate = new Date('2025-12-31');
      const result = TaskValidation.safeParse({
        name: 'Test Task',
        description: 'Test description',
        priority: 'high',
        difficulty: 'hard',
        dueDate,
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.dueDate).toEqual(dueDate);
      }
    });

    it('should pass validation with optional assigneeIds', () => {
      const result = TaskValidation.safeParse({
        name: 'Test Task',
        description: 'Test description',
        priority: 'urgent',
        difficulty: 'easy',
        assigneeIds: ['user1', 'user2', 'user3'],
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.assigneeIds).toEqual(['user1', 'user2', 'user3']);
      }
    });

    it('should pass validation with null dueDate', () => {
      const result = TaskValidation.safeParse({
        name: 'Test Task',
        description: 'Test description',
        priority: 'low',
        difficulty: 'medium',
        dueDate: null,
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.dueDate).toBeNull();
      }
    });

    it('should pass validation with maximum name length', () => {
      const longName = 'a'.repeat(200);
      const result = TaskValidation.safeParse({
        name: longName,
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation with maximum description length', () => {
      const longDescription = 'a'.repeat(5000);
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: longDescription,
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation for all priority values', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'] as const;

      for (const priority of priorities) {
        const result = TaskValidation.safeParse({
          name: 'Test',
          description: 'Test',
          priority,
          difficulty: 'medium',
        });

        expect(result.success).toBe(true);
      }
    });

    it('should pass validation for all difficulty values', () => {
      const difficulties = ['easy', 'medium', 'hard'] as const;

      for (const difficulty of difficulties) {
        const result = TaskValidation.safeParse({
          name: 'Test',
          description: 'Test',
          priority: 'medium',
          difficulty,
        });

        expect(result.success).toBe(true);
      }
    });
  });

  describe('when task data is invalid', () => {
    it('should fail validation for empty name', () => {
      const result = TaskValidation.safeParse({
        name: '',
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });

    it('should fail validation for name exceeding maximum length', () => {
      const tooLongName = 'a'.repeat(201);
      const result = TaskValidation.safeParse({
        name: tooLongName,
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for description exceeding maximum length', () => {
      const tooLongDescription = 'a'.repeat(5001);
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: tooLongDescription,
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid priority', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        priority: 'invalid',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid difficulty', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        priority: 'medium',
        difficulty: 'invalid',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing name', () => {
      const result = TaskValidation.safeParse({
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing priority', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing difficulty', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        priority: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid assigneeIds type', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
        assigneeIds: 'not-an-array',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid assigneeIds elements', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
        assigneeIds: [1, 2, 3],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid dueDate type', () => {
      const result = TaskValidation.safeParse({
        name: 'Test',
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
        dueDate: 'not-a-date',
      });

      expect(result.success).toBe(false);
    });
  });
});
