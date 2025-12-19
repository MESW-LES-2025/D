export default function Loading() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-lg px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <div className="mb-8 flex justify-center">
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="mb-1 h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            </div>

            <div>
              <div className="mb-1 h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-6 w-56 animate-pulse rounded bg-muted" />
            </div>

            <div>
              <div className="mb-1 h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="h-5 w-64 animate-pulse rounded bg-muted" />
            </div>

            <div className="shrink-0">
              <div className="h-20 w-20 animate-pulse rounded-full border-2 border-border bg-muted shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
