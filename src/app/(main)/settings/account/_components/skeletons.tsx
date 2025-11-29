import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type CardSkeletonProps = {
  className?: string;
};

export function NameUpdateCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('w-full py-4', className)}>
      <CardHeader className="gap-2 pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="px-6">
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AvatarUpdateCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('bg-card w-full', className)}>
      <CardContent>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex flex-1 flex-col justify-center">
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="h-4 w-86" />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PasswordUpdateCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('bg-card w-full py-4', className)}>
      <CardHeader className="gap-2 pb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="space-y-4 px-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="px-6">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DeleteAccountCardSkeleton({ className }: CardSkeletonProps) {
  return (
    <Card className={cn('bg-card w-full py-4 border-destructive', className)}>
      <CardHeader className="gap-2 pb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="space-y-1 px-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-px w-full bg-destructive" />
        <div className="px-6">
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
