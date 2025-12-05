'use client';

import type { ReactNode } from 'react';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import { IconBrandSpeedtest, IconCalendarCheck, IconCircleCheck, IconClockHour4, IconLoader, IconTrash, IconUsers } from '@tabler/icons-react';
import { AssigneesQuickAction } from '@/components/tasks/assignees-quick-action';
import { DescriptorQuickAction } from '@/components/tasks/descriptor-quick-action';
import { DifficultyQuickAction } from '@/components/tasks/dificulty-quick-action';
import { DueDateQuickAction } from '@/components/tasks/due-date-quick-action';
import { PriorityQuickAction } from '@/components/tasks/priority-quick-action';
import { StatusQuickAction } from '@/components/tasks/status-quick-action';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { difficulties, priorities, statuses } from '@/lib/task/task-options';

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
          <IconTrash className="ml-auto size-4 opacity-70 hover:opacity-100" />
        </SheetHeader>
        <Separator />

        <div className="space-y-8 px-4 py-6">
          {/* Descriptor (Title and Description) */}
          <div className="space-y-2">
            <DescriptorQuickAction
              title={task?.title ?? ''}
              description={task?.description ?? ''}
              taskId={task?.id ?? ''}
            />
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
                <StatusQuickAction
                  status={statuses.find(status => status.value === task?.status)}
                  taskId={task?.id ?? ''}
                />
              </span>
            </div>
            {/* Priority */}
            <div className="flex items-center gap-2">
              <IconCircleCheck className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Priority</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                <PriorityQuickAction
                  priority={priorities.find(priority => priority.value === task?.priority)}
                  taskId={task?.id ?? ''}
                />
              </span>
            </div>
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <IconBrandSpeedtest className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Difficulty</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                <DifficultyQuickAction
                  difficulty={difficulties.find(difficulty => difficulty.value === task?.difficulty)}
                  taskId={task?.id ?? ''}
                />
              </span>
            </div>
            {/* Due Date */}
            <div className="flex items-center gap-2">
              <IconCalendarCheck className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Due Date</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                <DueDateQuickAction
                  dueDate={task?.dueDate ?? undefined}
                  taskId={task?.id ?? ''}
                />
              </span>
            </div>
            {/* Assignees */}
            <div className="flex items-center gap-2">
              <IconUsers className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Assignees</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                <AssigneesQuickAction assignees={task?.assignees} taskId={task?.id ?? ''} />
              </span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
