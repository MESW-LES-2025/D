'use client';

import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { TaskDashboard, TaskStatus } from '@/types/task';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import * as React from 'react';
import { TaskCard } from './TaskCard';
import { TaskColumn } from './TaskColumn';

type TasksBoardProps = {
  initialTasks: TaskDashboard[];
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
};

const COLUMN_CONFIG = {
  todo: {
    title: 'To Do',
    id: 'to_do' as TaskStatus,
  },
  in_progress: {
    title: 'In Progress',
    id: 'in_progress' as TaskStatus,
  },
  done: {
    title: 'Done',
    id: 'completed' as TaskStatus,
  },
} as const;

export function TasksBoard({ initialTasks, onTaskMove }: TasksBoardProps) {
  const [tasks, setTasks] = React.useState<TaskDashboard[]>(initialTasks);
  const [activeTask, setActiveTask] = React.useState<TaskDashboard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Derive columns from tasks
  const todoTasks = React.useMemo(
    () => tasks.filter(task => task.status === 'to_do'),
    [tasks],
  );
  const inProgressTasks = React.useMemo(
    () => tasks.filter(task => task.status === 'in_progress'),
    [tasks],
  );
  const doneTasks = React.useMemo(
    () => tasks.filter(task => task.status === 'completed'),
    [tasks],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    let newStatus: TaskStatus | null = null;

    // Check if we're dropping on a column
    if (overId === 'to_do' || overId === 'in_progress' || overId === 'completed') {
      newStatus = overId as TaskStatus;
    } else {
      // If dropping on a task, find its column
      const targetTask = tasks.find(t => t.id === overId);
      if (targetTask) {
        newStatus = targetTask.status;
      }
    }

    if (newStatus) {
      const taskToUpdate = tasks.find(task => task.id === activeId);
      if (taskToUpdate && taskToUpdate.status !== newStatus) {
        const previousStatus = taskToUpdate.status;
        // Optimistically update
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === activeId ? { ...task, status: newStatus } : task,
          ),
        );

        if (onTaskMove) {
          try {
            await onTaskMove(activeId, newStatus);
          } catch {
            // Revert on error
            setTasks(prevTasks =>
              prevTasks.map(task =>
                task.id === activeId
                  ? { ...task, status: previousStatus }
                  : task,
              ),
            );
          }
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-6 p-6">
        <TaskColumn
          id="to_do"
          title={COLUMN_CONFIG.todo.title}
          tasks={todoTasks}
        />
        <TaskColumn
          id="in_progress"
          title={COLUMN_CONFIG.in_progress.title}
          tasks={inProgressTasks}
        />
        <TaskColumn
          id="completed"
          title={COLUMN_CONFIG.done.title}
          tasks={doneTasks}
        />
      </div>
      <DragOverlay>
        {activeTask
          ? (
              <div className="cursor-grabbing opacity-90">
                <TaskCard task={activeTask} isDragOverlay />
              </div>
            )
          : null}
      </DragOverlay>
    </DndContext>
  );
}
