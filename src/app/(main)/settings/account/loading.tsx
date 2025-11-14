import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="mt-1 h-4 w-64 rounded-md" />
      </div>
      <Separator />
    </div>
  );
}
