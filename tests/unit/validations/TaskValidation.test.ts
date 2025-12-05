import { describe, expect, it } from 'vitest';
import { TaskValidation } from '@/validations/TaskValidation';

describe('TaskValidation', () => {
  describe('when task data is valid', () => {
    it('should pass validation with all required fields', () => {
      const result = TaskValidation.safeParse({
        title: 'Test Task',
        description: 'Test description',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe('Test Task');
        expect(result.data.description).toBe('Test description');
        expect(result.data.status).toBe('todo');
        expect(result.data.priority).toBe('medium');
        expect(result.data.difficulty).toBe('medium');
      }
    });

    it('should pass validation with empty description', () => {
      const result = TaskValidation.safeParse({
        title: 'Test Task',
        description: '',
        status: 'backlog',
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
        title: 'Test Task',
        description: 'Test description',
        status: 'in_progress',
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
        title: 'Test Task',
        description: 'Test description',
        status: 'review',
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
        title: 'Test Task',
        description: 'Test description',
        status: 'done',
        priority: 'low',
        difficulty: 'medium',
        dueDate: null,
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.dueDate).toBeNull();
      }
    });

    it('should pass validation with maximum title length', () => {
      const longTitle = 'a'.repeat(200);
      const result = TaskValidation.safeParse({
        title: longTitle,
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation with maximum description length', () => {
      const longDescription = 'a'.repeat(5000);
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: longDescription,
        status: 'backlog',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation for all priority values', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'] as const;

      for (const priority of priorities) {
        const result = TaskValidation.safeParse({
          title: 'Test',
          description: 'Test',
          status: 'todo',
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
          title: 'Test',
          description: 'Test',
          status: 'todo',
          priority: 'medium',
          difficulty,
        });

        expect(result.success).toBe(true);
      }
    });

    it('should pass validation for all status values', () => {
      const statuses = ['backlog', 'todo', 'in_progress', 'review', 'done', 'archived', 'canceled'] as const;

      for (const status of statuses) {
        const result = TaskValidation.safeParse({
          title: 'Test',
          description: 'Test',
          status,
          priority: 'medium',
          difficulty: 'medium',
        });

        expect(result.success).toBe(true);
      }
    });
  });

  describe('when task data is invalid', () => {
    it('should fail validation for empty title', () => {
      const result = TaskValidation.safeParse({
        title: '',
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Title is required');
      }
    });

    it('should fail validation for title exceeding maximum length', () => {
      const tooLongTitle = 'a'.repeat(201);
      const result = TaskValidation.safeParse({
        title: tooLongTitle,
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for description exceeding maximum length', () => {
      const tooLongDescription = 'a'.repeat(5001);
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: tooLongDescription,
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid priority', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        priority: 'invalid',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid difficulty', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'invalid',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid status', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'invalid',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing title', () => {
      const result = TaskValidation.safeParse({
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing status', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        priority: 'medium',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing priority', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        difficulty: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for missing difficulty', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        priority: 'medium',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid assigneeIds type', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
        assigneeIds: 'not-an-array',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid assigneeIds elements', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
        assigneeIds: [1, 2, 3],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid dueDate type', () => {
      const result = TaskValidation.safeParse({
        title: 'Test',
        description: 'Test',
        status: 'todo',
        priority: 'medium',
        difficulty: 'medium',
        dueDate: 'not-a-date',
      });

      expect(result.success).toBe(false);
    });
  });
});
