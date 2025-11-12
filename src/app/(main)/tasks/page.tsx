'use client';

import type { TaskDashboard } from '@/types/task';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TasksBoard } from '@/components/tasks/TasksBoard';

async function handleTaskMove(taskId: string, newStatus: TaskDashboard['status']) {
  try {
    const response = await fetch(`/api/task/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    toast.success('Task updated successfully');
  } catch (error) {
    toast.error('Failed to update task');
    console.error('Failed to move task:', error);
    throw new Error('Failed to update task');
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();

      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-black">Tasks</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        {loading
          ? (
              <div className="flex h-full items-center justify-center">
                <p>Loading tasks...</p>
              </div>
            )
          : error
            ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-red-500">
                    Error:
                    {error}
                  </p>
                </div>
              )
            : (
                <TasksBoard
                  initialTasks={tasks}
                  onTaskMove={handleTaskMove}
                />
              )}
      </main>
    </div>
  );
}
