'use client';

import type { ReactNode } from 'react';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import { IconBrandSpeedtest, IconCalendarCheck, IconCircleCheck, IconClockHour4, IconLoader, IconPencil, IconUsers } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup, AvatarGroupTooltip } from '@/components/ui/avatar-group';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { difficulties, priorities, statuses } from '@/lib/task/task-options';
import { cn, getInitials } from '@/lib/utils';

type TaskSheetProps = {
  children?: ReactNode;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  task?: TaskWithAssignees | null;
};

export function TaskSheet({ children, open, onOpenChangeAction, task }: TaskSheetProps) {
  // In the future, use the 'task' prop to display dynamic data
  return (
    <Sheet open={open} onOpenChange={onOpenChangeAction}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="gap-0" onOpenAutoFocus={event => event.preventDefault()}>
        <SheetHeader className="pr-12">
          <IconPencil className="ml-auto size-4 opacity-70 hover:opacity-100" />
        </SheetHeader>
        <Separator />

        <div className="space-y-8 px-4 py-6">
          {/* Tittle and Description */}
          <div className="space-y-2">
            <SheetTitle className="text-xl">{task?.title}</SheetTitle>
            <SheetDescription>
              {task?.description}
            </SheetDescription>
          </div>

          {/* Metadata */}
          <div className="flex flex-col gap-3 text-sm">
            {/* Created time */}
            <div className="flex items-center gap-2">
              <IconClockHour4 className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Created time</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {task?.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                <span className="ml-2 text-muted-foreground">{task?.createdAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            </div>
            {/* Status */}
            <div className="flex items-center gap-2">
              <IconLoader className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Status</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {(() => {
                  const selectedStatus = task?.status;
                  const status = statuses.find(status => status.value === selectedStatus);
                  if (!status) {
                    return null;
                  }

                  return (
                    <span className="inline-flex items-center gap-1">
                      {status.icon && <status.icon className="size-4" />}
                      <span>{status.label}</span>
                    </span>
                  );
                })()}
              </span>
            </div>
            {/* Priority */}
            <div className="flex items-center gap-2">
              <IconCircleCheck className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Priority</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {(() => {
                  const selectedPriority = task?.priority;
                  const priority = priorities.find(priority => priority.value === selectedPriority);
                  if (!priority) {
                    return null;
                  }

                  return (
                    <span className="inline-flex items-center gap-1">
                      {priority.icon && <priority.icon className="size-4" />}
                      <span>{priority.label}</span>
                    </span>
                  );
                })()}
              </span>
            </div>
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <IconBrandSpeedtest className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Difficulty</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {(() => {
                  const selectedDifficulty = task?.difficulty;
                  const difficulty = difficulties.find(difficulty => difficulty.value === selectedDifficulty);
                  if (!difficulty) {
                    return null;
                  }

                  return (
                    <span className="inline-flex items-center gap-1">
                      <span>{difficulty.label}</span>
                    </span>
                  );
                })()}
              </span>
            </div>
            {/* Due Date */}
            <div className="flex items-center gap-2">
              <IconCalendarCheck className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Due Date</span>
              {(() => {
                const dueDate = task?.dueDate;
                return (
                  <span
                    className={cn(dueDate ?? 'text-muted-foreground', 'ml-2 min-w-0 truncate text-right sm:text-left')}
                  >
                    {dueDate ? dueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'No due date'}
                  </span>
                );
              })()}
            </div>
            {/* Assignees */}
            <div className="flex items-center gap-2">
              <IconUsers className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Assignees</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                <AvatarGroup variant="motion" className="-space-x-3">
                  {(task?.assignees ?? []).map(assignee => (
                    <Avatar key={assignee.id} className="border-3 border-background">
                      {assignee.image && (
                        <AvatarImage src={assignee.image} alt={assignee.name} />
                      )}
                      <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                      <AvatarGroupTooltip>
                        <p>{assignee.name}</p>
                      </AvatarGroupTooltip>
                    </Avatar>
                  ))}
                </AvatarGroup>
              </span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
