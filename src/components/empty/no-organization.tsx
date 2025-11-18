import { IconWorldX } from '@tabler/icons-react';

import { CreateOrgDialog } from '@/components/dialogs/create-org-dialog';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export function NoOrganization({ className }: { className?: string }) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconWorldX />
        </EmptyMedia>
        <EmptyTitle>No Organizations Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created or joined any organizations yet. Get started by creating
          your first organization or joining an existing one.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateOrgDialog>
          <Button>Create Organization</Button>
        </CreateOrgDialog>
      </EmptyContent>
    </Empty>
  );
}
