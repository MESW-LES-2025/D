'use client';

import type { Task } from '@/types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CalendarClock, GripVertical } from 'lucide-react';
import * as React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TaskCardProps = {
  task: Task;
  isDragOverlay?: boolean;
};

export function TaskCard({ task, isDragOverlay = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if task is overdue
  const isOverdue = React.useMemo(() => {
    if (!task.dueAt) {
      return false;
    }
    const dueDate = new Date(task.dueAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, [task.dueAt]);

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'opacity-50',
      )}
    >
      <Card
        className={cn(
          'cursor-move rounded-2xl border bg-card transition-shadow hover:shadow-md',
          isDragOverlay && 'shadow-2xl',
          !isDragOverlay && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
        role="article"
        aria-roledescription="draggable"
        aria-label={`Task: ${task.title}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="mt-1 touch-none text-muted-foreground hover:text-foreground focus:outline-none"
              {...listeners}
              {...attributes}
              aria-label="Drag handle"
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 space-y-3">
              {/* Header with avatar and assignee */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assigneeName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{task.assigneeName}</span>
              </div>

              {/* Task title */}
              <h3 className="leading-tight font-semibold">{task.title}</h3>

              {/* Metadata and badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Created date */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Created:
                    {formatDate(task.createdAt)}
                  </span>
                </div>

                {/* Due date if exists */}
                {task.dueAt && (
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  >
                    <CalendarClock className="h-3 w-3" />
                    <span>
                      Due:
                      {formatDate(task.dueAt)}
                    </span>
                  </div>
                )}

                {/* Critical badge */}
                {task.isCritical && (
                  <Badge variant="destructive" className="h-5 px-2 text-xs">
                    Critical
                  </Badge>
                )}

                {/* Overdue badge */}
                {isOverdue && (
                  <Badge variant="destructive" className="h-5 px-2 text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
