'use client';

import { IconCalendar, IconCircle, IconEdit, IconTrash, IconTrophy } from '@tabler/icons-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { getInitials } from '@/lib/utils';

type Task = {
  id: string;
  name: string;
  completed?: boolean;
  isPersonal?: boolean;
  assignees?: Array<{ id: string; name: string }>;
};

type Goal = {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  points?: number;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeId?: string;
  assignees?: Array<{ id: string; name: string; email: string }>;
  tasks?: Task[];
  totalTasks?: number;
  completedTeamTasks?: number;
  completedPersonalTasks?: number;
  onDelete?: (id: string) => void;
  onEdit?: (goal: Goal) => void;
};

export function GoalCard({
  goal,
  onDelete,
  onEdit,
}: {
  goal: Goal;
  onDelete?: (id: string) => void;
  onEdit?: (goal: Goal) => void;
}) {
  const [_editOpen, _setEditOpen] = useState(false);
  const totalTasks = goal.totalTasks || goal.tasks?.length || 0;
  const completedTeamTasks = goal.completedTeamTasks || 0;
  const completedPersonalTasks = goal.completedPersonalTasks || 0;
  const overallProgressPercentage = totalTasks > 0 ? (completedTeamTasks / totalTasks) * 100 : 0;
  const personalProgressPercentage = totalTasks > 0 ? (completedPersonalTasks / totalTasks) * 100 : 0;

  // Calculate days remaining
  const dueDate = goal.dueDate ? new Date(goal.dueDate) : null;
  const today = new Date();
  const daysRemaining = dueDate
    ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysRemaining !== null && daysRemaining < 0;
  const isUrgent = daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;

  const getAvatarFallback = (name?: string) => {
    if (!name) {
      return '?';
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="text-xl leading-tight font-semibold text-foreground">{goal.name}</h3>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <IconTrophy className="h-3 w-3" />
            {goal.points || 0}
            {' '}
            pts
          </Badge>
        </div>

        {goal.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{goal.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progress Section */}
        {totalTasks > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Team Progress</span>
              <span className="font-semibold text-foreground">
                {completedTeamTasks}
                /
                {totalTasks}
                {' '}
                tasks
              </span>
            </div>
            {/* Stacked progress bar: personal (green) on top of team (blue) */}
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              {/* Team progress bar */}
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${overallProgressPercentage}%` }}
              />
              {/* Personal progress bar (overlaid) */}
              <div
                className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300"
                style={{ width: `${personalProgressPercentage}%` }}
              />
            </div>
            {/* Legend */}
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Your tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Team progress</span>
              </div>
            </div>
            {/* Personal progress info */}
            {completedPersonalTasks > 0 && (
              <p className="text-xs text-muted-foreground">
                You've completed
                {' '}
                <span className="font-semibold text-foreground">{completedPersonalTasks}</span>
                {' '}
                of your assigned tasks
              </p>
            )}
          </div>
        )}

        {/* Tasks List */}
        {goal.tasks && goal.tasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Tasks</h4>
            <div className="space-y-1.5">
              {goal.tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2 text-sm">
                  <IconCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      task.completed
                        ? task.isPersonal
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-blue-600 dark:text-blue-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span className={`flex-1 ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.name}
                  </span>
                  {/* Assignees avatars */}
                  {task.assignees && task.assignees.length > 0 && (
                    <div className="ml-auto flex -space-x-2">
                      {task.assignees.map(assignee => (
                        <Avatar key={assignee.id} className="h-5 w-5 border border-background">
                          <AvatarFallback className="text-xs">
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          {/* Assignees */}
          {goal.assignees && goal.assignees.length > 0
            ? (
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {goal.assignees.map(assignee => (
                        <Tooltip key={assignee.id}>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 cursor-pointer border-2 border-background">
                              <AvatarFallback className="text-xs font-medium">
                                {getInitials(assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            {assignee.name}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">
                        {goal.assignees.length}
                        {' '}
                        assignee
                        {goal.assignees.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </TooltipProvider>
              )
            : goal.assigneeName && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-xs font-medium">
                    {getAvatarFallback(goal.assigneeName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">{goal.assigneeName}</span>
                </div>
              </div>
            )}

          <div className="ml-auto flex items-center gap-3">
            {/* Due Date */}
            {dueDate && daysRemaining !== null && (
              <div className="flex items-center gap-1.5">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <span
                  className={`text-sm font-medium ${
                    isOverdue
                      ? 'text-destructive'
                      : isUrgent
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                </span>
              </div>
            )}

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(goal.id);
              }}
            >
              <IconTrash size={16} />
            </Button>

            {/* Edit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(goal);
              }}
            >
              <IconEdit size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
