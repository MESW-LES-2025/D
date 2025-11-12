export type TaskStatus = 'to_do' | 'in_progress' | 'completed';

export type TaskDashboard = {
  id: string;
  status: TaskStatus;
  name: string;
  dueDate: Date;
  userId: string | null;
  userName: string | null;
};
