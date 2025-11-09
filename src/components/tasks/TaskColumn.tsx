'use client';

import type { Task } from '@/types/task';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';

type TaskColumnProps = {
  id: string;
  title: string;
  tasks: Task[];
};

export function TaskColumn({ id, title, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">{title}</h2>
        <Badge variant="secondary" className="ml-2">
          {tasks.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 rounded-lg bg-muted/30 p-4 transition-colors',
          isOver && 'bg-muted/50 ring-2 ring-primary/20',
        )}
        role="region"
        aria-roledescription="droppable"
        aria-label={`${title} column`}
      >
        <ScrollArea className="h-full">
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {tasks.length > 0
                ? (
                    tasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))
                  )
                : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No tasks
                    </p>
                  )}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    </div>
  );
}
