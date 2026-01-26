export default function Loading() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-6">
        {/* Main container */}
        <div className="rounded-lg bg-card p-8 shadow-md">
          {/* Header section */}
          <div className="mb-8 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          </div>

          {/* Tabs and points summary */}
          <div className="mb-8 flex items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
              <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
            </div>

            {/* Points summary */}
            <div className="h-14 w-32 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Points summary card */}
          <div className="mb-6 rounded-lg bg-muted p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* Rewards grid - mimics the 3-column layout */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* First reward card */}
            <div className="flex flex-col rounded-lg border p-4">
              <div className="flex flex-1 flex-col space-y-3">
                {/* Image placeholder */}
                <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />

                {/* Title and points */}
                <div className="flex items-start justify-between gap-2">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                </div>

                {/* Progress section */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-2.5 w-full animate-pulse rounded-full bg-muted" />
                  <div className="flex justify-between">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto flex gap-2 pt-2">
                  <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                  <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            </div>

            {/* Second reward card */}
            <div className="flex flex-col rounded-lg border p-4">
              <div className="flex flex-1 flex-col space-y-3">
                <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
                <div className="flex items-start justify-between gap-2">
                  <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted" />
                  <div className="flex justify-between">
                    <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-2">
                  <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                  <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            </div>

            {/* Third reward card */}
            <div className="flex flex-col rounded-lg border p-4">
              <div className="flex flex-1 flex-col space-y-3">
                <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
                <div className="flex items-start justify-between gap-2">
                  <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="space-y-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted" />
                  <div className="flex justify-between">
                    <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-8 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-auto flex gap-2 pt-2">
                  <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                  <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
