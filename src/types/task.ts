export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
  id: string;
  title: string;
  assigneeName: string;
  createdAt: string; // ISO date
  dueAt?: string; // ISO date (optional)
  isCritical: boolean; // critical status
  status: TaskStatus;
};
