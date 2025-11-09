'use client';

import type { Task } from '@/types/task';
import { TasksBoard } from '@/components/tasks/TasksBoard';
// Sample data for demonstration
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design login screen',
    assigneeName: 'Ana Silva',
    createdAt: '2025-10-20T10:00:00Z',
    dueAt: '2025-11-05T23:59:59Z',
    isCritical: true,
    status: 'todo',
  },
  {
    id: '2',
    title: 'Implement auth flow',
    assigneeName: 'Rui Santos',
    createdAt: '2025-10-22T14:30:00Z',
    dueAt: '2025-11-06T23:59:59Z',
    isCritical: false,
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'Write unit tests',
    assigneeName: 'Maria Costa',
    createdAt: '2025-10-25T09:15:00Z',
    isCritical: false,
    status: 'todo',
  },
  {
    id: '4',
    title: 'Deploy preview env',
    assigneeName: 'João Lima',
    createdAt: '2025-10-28T16:45:00Z',
    dueAt: '2025-11-02T23:59:59Z',
    isCritical: false,
    status: 'done',
  },
  {
    id: '5',
    title: 'Review PR comments',
    assigneeName: 'Ana Silva',
    createdAt: '2025-10-29T11:00:00Z',
    dueAt: '2025-10-30T18:00:00Z', // This will be overdue
    isCritical: true,
    status: 'todo',
  },
  {
    id: '6',
    title: 'Update documentation',
    assigneeName: 'Maria Costa',
    createdAt: '2025-10-30T10:00:00Z',
    isCritical: false,
    status: 'in_progress',
  },
];

// Mock API function (replace with actual API call)
async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // In production, this would be an actual API call:
  // const response = await fetch(`/api/tasks/${taskId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status: newStatus }),
  // });
  // if (!response.ok) throw new Error('Failed to update task');
  // eslint-disable-next-line no-console
  console.log(`Task ${taskId} updated to ${newStatus}`);
}

export default function TasksPage() {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-black">Tasks</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <TasksBoard
          initialTasks={sampleTasks}
          onTaskMove={updateTaskStatus}
        />
      </main>
    </div>
  );
}
