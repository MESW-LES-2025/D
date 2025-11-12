'use client';

import { IconAlertTriangle } from '@tabler/icons-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconAlertTriangle />
        </EmptyMedia>
        <EmptyTitle>Invitation Not Found</EmptyTitle>
        <EmptyDescription>
          This invitation link may be invalid, expired, or already used.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
