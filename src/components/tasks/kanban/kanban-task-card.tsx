'use client';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import { IconCalendarCheck } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  KanbanBoardCard,
  KanbanBoardCardTitle,
} from '@/components/ui/kanban';
import { Separator } from '@/components/ui/separator';
import { difficulties, priorities } from '@/lib/task/task-options';
import { cn } from '@/lib/utils';

type KanbanTaskCardProps = {
  task: TaskWithAssignees;
  onClickAction?: () => void;
  isActive?: boolean;
};

function toDate(date: Date | string | null | undefined): Date | null {
  if (!date) {
    return null;
  }
  return date instanceof Date ? date : new Date(date);
}

function formatDueDate(date: Date | string | null | undefined): string | null {
  const dueDate = toDate(date);
  if (!dueDate) {
    return null;
  }

  return dueDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function KanbanTaskCard({ task, onClickAction, isActive = false }: KanbanTaskCardProps) {
  const priorityOption = priorities.find(p => p.value === task.priority);
  const difficultyOption = difficulties.find(d => d.value === task.difficulty);
  const formattedDueDate = formatDueDate(task.dueDate);

  return (
    <KanbanBoardCard
      data={task}
      onClick={(e) => {
        // Prevent click when dragging
        if (e.defaultPrevented) {
          return;
        }
        onClickAction?.();
      }}
      isActive={isActive}
      className="gap-4 transition-colors hover:border-primary/50"
    >
      {/* Title */}
      <KanbanBoardCardTitle className="line-clamp-2 text-base font-medium">
        {task.title}
      </KanbanBoardCardTitle>

      {/* Metadata list */}
      <div className="flex gap-2 text-xs">
        <Badge
          variant="secondary"
          className={cn('text-white', priorityOption?.color)}
        >
          {priorityOption?.icon && <priorityOption.icon className="size-4" />}
          <span>{priorityOption?.label ?? <span className="text-muted-foreground">None</span>}</span>
        </Badge>

        <Badge
          className={cn(difficultyOption?.colors?.background, difficultyOption?.colors?.foreground)}
        >
          {difficultyOption?.icon && <difficultyOption.icon className="size-4" />}
          <span>{difficultyOption?.label ?? <span className="text-muted-foreground">None</span>}</span>
        </Badge>

      </div>

      <Separator />

      <div className="flex h-6 items-center justify-between">
        {/* Due Date */}
        <div className="flex items-center gap-2">
          <IconCalendarCheck className="size-4 text-muted-foreground" />
          <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground')}>
            {formattedDueDate ?? 'No due date'}
          </span>
        </div>

        {/* Assignees */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center">
            {task.assignees && task.assignees.length > 0
              ? (
                  <div className="flex -space-x-1.5">
                    {task.assignees.slice(0, 3).map(assignee => (
                      <Avatar key={assignee.id} className="size-7 border-2 border-background">
                        <AvatarImage src={assignee.image ?? undefined} alt={assignee.name} />
                        <AvatarFallback className="text-[10px]">
                          {assignee.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {task.assignees.length > 3 && (
                      <Avatar className="size-7 border-2 border-background">
                        <AvatarFallback className="bg-muted text-[10px]">
                          +
                          {task.assignees.length - 3}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              : null}
          </span>
        </div>
      </div>
    </KanbanBoardCard>
  );
}
