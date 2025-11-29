'use client';

import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export function EmptyCard() {
  return (
    <Card className="border-muted-foreground/40 bg-muted/5">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">
            No tasks yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Create your first task to start tracking your progress and unlock insights here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
