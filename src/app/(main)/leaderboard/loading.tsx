export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h1 className="mb-8 text-center text-3xl font-bold">Leaderboard</h1>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


