import type { Metadata } from 'next';
import { IconArrowUpRight, IconWorldX } from '@tabler/icons-react';
import { headers } from 'next/headers';

import Link from 'next/link';
import { redirect } from 'next/navigation';
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
import { auth } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'TaskUp | Dashboard',
  description: 'Your personal dashboard to manage tasks efficiently.',
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  return (
    <div className="py-12">
      <div className="max-w-lg">
        <Empty>
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
            <div className="flex gap-2">
              <CreateOrgDialog />
              <Button variant="outline">Use Invite</Button>
            </div>
          </EmptyContent>
          <Button
            variant="link"
            asChild
            className="text-muted-foreground"
            size="sm"
          >
            <Link href="#">
              Learn More
              {' '}
              <IconArrowUpRight />
            </Link>
          </Button>
        </Empty>
      </div>
    </div>
  );
}
