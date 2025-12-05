import { describe, expect, it } from 'vitest';
import { TeamGoalValidation } from '@/validations/TeamGoalValidation';

describe('TeamGoalValidation', () => {
  describe('when goal data is valid', () => {
    it('should pass validation with all required fields', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Complete Project',
        description: 'Finish the quarterly project',
        pointsReward: '100',
        dueDate: '2025-12-31',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.title).toBe('Complete Project');
        expect(result.data.pointsReward).toBe('100');
        expect(result.data.assigneeIds).toEqual(['user1']);
        expect(result.data.taskIds).toEqual(['task1']);
      }
    });

    it('should pass validation with multiple assignees', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Collaborate on Goal',
        pointsReward: '50',
        assigneeIds: ['user1', 'user2', 'user3'],
        taskIds: ['task1', 'task2'],
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.assigneeIds).toEqual(['user1', 'user2', 'user3']);
        expect(result.data.assigneeIds.length).toBe(3);
      }
    });

    it('should pass validation with multiple tasks', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Multi-task Goal',
        pointsReward: '150',
        assigneeIds: ['user1'],
        taskIds: ['task1', 'task2', 'task3', 'task4'],
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.taskIds).toEqual(['task1', 'task2', 'task3', 'task4']);
        expect(result.data.taskIds.length).toBe(4);
      }
    });

    it('should pass validation with optional description', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Simple Goal',
        pointsReward: '25',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation with optional dueDate', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal without date',
        pointsReward: '75',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.dueDate).toBeUndefined();
      }
    });

    it('should pass validation with high points value', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'High Points Goal',
        pointsReward: '999',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.pointsReward).toBe('999');
      }
    });

    it('should pass validation with long title', () => {
      const longTitle = 'A'.repeat(100);
      const result = TeamGoalValidation.safeParse({
        title: longTitle,
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation with long description', () => {
      const longDescription = 'a'.repeat(1000);
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        description: longDescription,
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);
    });

    it('should pass validation with future dueDate', () => {
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const result = TeamGoalValidation.safeParse({
        title: 'Future Goal',
        pointsReward: '100',
        dueDate: futureDate,
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('when goal data is invalid', () => {
    it('should fail validation for empty title', () => {
      const result = TeamGoalValidation.safeParse({
        title: '',
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Goal title is required');
      }
    });

    it('should fail validation for title shorter than 3 characters', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'AB',
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 3 characters');
      }
    });

    it('should fail validation for missing title', () => {
      const result = TeamGoalValidation.safeParse({
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for empty pointsReward', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Points reward is required');
      }
    });

    it('should fail validation for missing pointsReward', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for empty assigneeIds array', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: [],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Select at least one assignee');
      }
    });

    it('should fail validation for missing assigneeIds', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for empty taskIds array', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: [],
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Select at least one related task');
      }
    });

    it('should fail validation for missing taskIds', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: ['user1'],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid assigneeIds type', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: 'user1',
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid assigneeIds elements', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: [1, 2, 3],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid taskIds type', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: 'task1',
      });

      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid taskIds elements', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '50',
        assigneeIds: ['user1'],
        taskIds: [1, 2, 3],
      });

      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle title exactly at minimum length', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'ABC',
        pointsReward: '1',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);
    });

    it('should handle mixed valid string and numeric point values', () => {
      const result = TeamGoalValidation.safeParse({
        title: 'Goal',
        pointsReward: '0',
        assigneeIds: ['user1'],
        taskIds: ['task1'],
      });

      expect(result.success).toBe(true);
    });

    it('should preserve all data through validation', () => {
      const input = {
        title: 'Complete Q4 Goals',
        description: 'Achieve all quarterly objectives',
        pointsReward: '500',
        dueDate: '2025-12-31',
        assigneeIds: ['user1', 'user2'],
        taskIds: ['task1', 'task2', 'task3'],
      };

      const result = TeamGoalValidation.safeParse(input);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });
  });
});
