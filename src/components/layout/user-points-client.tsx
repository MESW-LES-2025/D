'use client';

type UserPointsClientProps = {
  earnedPoints: number;
};

export function UserPointsClient({ earnedPoints }: UserPointsClientProps) {
  return (
    <div className="px-2 py-2 text-xs text-muted-foreground">
      <div className="font-semibold text-foreground">
        {earnedPoints}
        {' '}
        pts
      </div>
    </div>
  );
}
