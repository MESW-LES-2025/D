import { Skeleton } from '@/components/ui/skeleton';

export default function PointHistoryLoading() {
  return (
    <div className="flex-1 space-y-6 xl:max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
