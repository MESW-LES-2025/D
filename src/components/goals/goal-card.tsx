'use client';

import { IconCalendar, IconCircle, IconEdit, IconTrash, IconTrophy } from '@tabler/icons-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Task = {
  id: string;
  name: string;
  completed?: boolean;
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
  tasks?: Task[];
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
  const totalTasks = goal.tasks?.length || 0;
  const completedTasks = 0; // Hardcoded as 0 until task completion feature is added
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">
                {completedTasks}
                /
                {totalTasks}
                {' '}
                tasks
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Tasks List */}
        {goal.tasks && goal.tasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Tasks</h4>
            <div className="space-y-1.5">
              {goal.tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2 text-sm">
                  <IconCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{task.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          {/* Assignee */}
          {goal.assigneeName && (
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
