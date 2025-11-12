import { IconLoader2 } from '@tabler/icons-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export default function Loading() {
  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconLoader2 className="animate-spin" />
        </EmptyMedia>
        <EmptyTitle>Processing your invitation</EmptyTitle>
        <EmptyDescription>
          Please wait while we process your invitation. Do not refresh the page.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
