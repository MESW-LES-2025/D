import { IconPlus } from '@tabler/icons-react';
import { DynamicHeader } from '@/components/layout/dynamic-header';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  return (
    <DynamicHeader
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={(
        <Button size="sm">
          <IconPlus className="h-4 w-4" />
          Add Task
        </Button>
      )}
    />
  );
}
