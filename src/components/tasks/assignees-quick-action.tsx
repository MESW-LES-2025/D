'use client';
import type { User } from 'better-auth';
import { IconPlus } from '@tabler/icons-react';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup, AvatarGroupTooltip } from '@/components/ui/avatar-group';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { client as authClient } from '@/lib/auth/auth-client';
import { getInitials } from '@/lib/utils';
import { assignUserToTask } from './assignees-quick-action.actions';

type AssigneesQuickActionProps = {
  assignees: User[] | undefined;
  taskId: string;
};

export function AssigneesQuickAction({ assignees, taskId }: AssigneesQuickActionProps) {
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [optimisticAssignees, addOptimisticAssignee] = useOptimistic(
    assignees ?? [],
    (state, newAssignee: User) => [...state, newAssignee],
  );

  const self = session?.user;
  const alreadyAssigned = !!(optimisticAssignees ?? []).find(a => a.id === self?.id);
  const assigneeList = optimisticAssignees ?? [];

  const handleAssignSelf = () => {
    if (!self) {
      return;
    }

    startTransition(async () => {
      addOptimisticAssignee(self);
      const result = await assignUserToTask(taskId, self.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Assigned to task successfully!');
    });
  };

  const avatarElements = assigneeList.map(assignee => (
    <Avatar key={assignee.id} className="border-3 border-background">
      {assignee.image && (
        <AvatarImage src={assignee.image} alt={assignee.name} />
      )}
      <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
      <AvatarGroupTooltip>
        <p>{assignee.name}</p>
      </AvatarGroupTooltip>
    </Avatar>
  ));

  if (self && !alreadyAssigned) {
    avatarElements.push(
      <Tooltip key="add-self">
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-6.5 rounded-full border-dashed bg-background! hover:bg-accent!"
            onClick={handleAssignSelf}
            disabled={isPending}
          >
            <IconPlus className="size-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Assign yourself</p>
        </TooltipContent>
      </Tooltip>,
    );
  }

  return (
    <div className="flex items-center gap-1">
      {assigneeList.length > 0 && (
        <AvatarGroup variant="motion" className="group -space-x-3">
          {avatarElements}
        </AvatarGroup>
      )}
    </div>
  );
}
