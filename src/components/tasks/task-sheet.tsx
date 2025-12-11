'use client';

import type { ReactNode } from 'react';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import { IconBrandSpeedtest, IconCalendarCheck, IconCircleCheck, IconClockHour4, IconLoader, IconUsers } from '@tabler/icons-react';
import { AssigneesQuickAction } from '@/components/tasks/assignees-quick-action';
import { DeleteTaskButton } from '@/components/tasks/delete-task';
import { DescriptorQuickAction } from '@/components/tasks/descriptor-quick-action';
import { DifficultyQuickAction } from '@/components/tasks/dificulty-quick-action';
import { DueDateQuickAction } from '@/components/tasks/due-date-quick-action';
import { PriorityQuickAction } from '@/components/tasks/priority-quick-action';
import { StatusQuickAction } from '@/components/tasks/status-quick-action';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { difficulties, priorities, allStatuses as statuses } from '@/lib/task/task-options';

type TaskSheetProps = {
  children?: ReactNode;
  open?: boolean;
  onOpenChangeAction?: (open: boolean) => void;
  task?: TaskWithAssignees | null;
  isAdmin?: boolean;
};

export function TaskSheet({ children, open, onOpenChangeAction, task, isAdmin = true }: TaskSheetProps) {
  const priorityOption = priorities.find(priority => priority.value === task?.priority);
  const difficultyOption = difficulties.find(difficulty => difficulty.value === task?.difficulty);

  return (
    <Sheet open={open} onOpenChange={onOpenChangeAction}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="gap-0" onOpenAutoFocus={event => event.preventDefault()}>
        <SheetHeader className="pr-12">
          {isAdmin
            ? (
                <DeleteTaskButton taskId={task?.id ?? ''} onDelete={() => onOpenChangeAction?.(false)} />
              )
            : <div className="size-4"></div>}
        </SheetHeader>
        <Separator />

        <div className="space-y-8 px-4 py-6">
          {/* Descriptor (Title and Description) */}
          <div className="space-y-2">
            {isAdmin
              ? (
                  <DescriptorQuickAction
                    title={task?.title ?? ''}
                    description={task?.description ?? ''}
                    taskId={task?.id ?? ''}
                  />
                )
              : (
                  <div className="group relative space-y-2">
                    <SheetTitle className="text-xl">{task?.title}</SheetTitle>
                    <SheetDescription>
                      {task?.description || 'No description'}
                    </SheetDescription>
                  </div>
                )}
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
                  showHidden={isAdmin}
                />
              </span>
            </div>
            {/* Priority */}
            <div className="flex items-center gap-2">
              <IconCircleCheck className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Priority</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {isAdmin
                  ? (
                      <PriorityQuickAction
                        priority={priorityOption}
                        taskId={task?.id ?? ''}
                      />
                    )
                  : (
                      <span className="inline-flex items-center gap-1">
                        {priorityOption?.icon && <priorityOption.icon className="size-4" />}
                        <span>{priorityOption?.label ?? <span className="text-muted-foreground">No priority</span>}</span>
                      </span>
                    )}
              </span>
            </div>
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <IconBrandSpeedtest className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Difficulty</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {isAdmin
                  ? (
                      <DifficultyQuickAction
                        difficulty={difficultyOption}
                        taskId={task?.id ?? ''}
                        task={task}
                      />
                    )
                  : (
                      <span className="inline-flex items-center gap-1">
                        {difficultyOption?.icon && <difficultyOption.icon className="size-4" />}
                        <span>{difficultyOption?.label ?? <span className="text-muted-foreground">No difficulty</span>}</span>
                      </span>
                    )}
              </span>
            </div>
            {/* Due Date */}
            <div className="flex items-center gap-2">
              <IconCalendarCheck className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Due Date</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {isAdmin
                  ? (
                      <DueDateQuickAction
                        dueDate={task?.dueDate ?? undefined}
                        taskId={task?.id ?? ''}
                      />
                    )
                  : (
                      <span className="inline-flex items-center gap-1">
                        {task?.dueDate
                          ? (
                              task?.dueDate.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            )
                          : (
                              <span className="text-muted-foreground">No due date</span>
                            )}
                      </span>
                    )}
              </span>
            </div>
            {/* Assignees */}
            <div className="flex items-center gap-2">
              <IconUsers className="size-4 text-muted-foreground" />
              <span className="max-w-32 flex-1 font-semibold text-muted-foreground">Assignees</span>
              <span className="ml-2 min-w-0 truncate text-right sm:text-left">
                {/* TODO: Have a Assign yourself for non admins and a assigne other and multiple users for admins */}
                <AssigneesQuickAction assignees={task?.assignees} taskId={task?.id ?? ''} />
              </span>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
