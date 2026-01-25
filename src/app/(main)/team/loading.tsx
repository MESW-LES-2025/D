export default function Loading() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6">
        {/* Main container */}
        <div className="rounded-lg bg-card p-8 shadow-md">
          {/* Header section */}
          <div className="mb-8 flex items-start justify-between">
            <div className="h-9 w-96 animate-pulse rounded bg-muted" />
            <div className="h-10 w-36 animate-pulse rounded bg-muted" />
          </div>

          {/* Header with stats and search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title and count */}
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>

            {/* Search and filter */}
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="relative max-w-sm flex-1">
                <div className="h-10 w-full animate-pulse rounded-md bg-muted pl-10" />
              </div>

              {/* Filter button */}
              <div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          </div>

          {/* Active filters indicator (optional, shows conditionally) */}
          <div className="mb-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>

          {/* Members grid - 2 columns on medium screens */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* First member card */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-center space-x-3">
                  {/* Avatar */}
                  <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />

                  {/* User info */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                      <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>

                {/* Edit button */}
                <div className="h-8 w-14 animate-pulse rounded-md bg-muted" />
              </div>
            </div>

            {/* Second member card */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-center space-x-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-6 w-14 animate-pulse rounded bg-muted" />
                      <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>

                <div className="h-8 w-14 animate-pulse rounded-md bg-muted" />
              </div>
            </div>

            {/* Third member card */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-center space-x-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-52 animate-pulse rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-6 w-10 animate-pulse rounded bg-muted" />
                      <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>

                <div className="h-8 w-14 animate-pulse rounded-md bg-muted" />
              </div>
            </div>

            {/* Fourth member card */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-center space-x-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-muted" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                      <div className="h-6 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>

                <div className="h-8 w-14 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
          </div>

          {/* No results message (hidden during loading) */}
          <div className="py-8 text-center">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
