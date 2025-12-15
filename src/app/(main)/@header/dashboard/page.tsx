import { CreateGoalDialog } from '@/components/goals/create-goal-dialog';
import { DynamicHeader } from '@/components/layout/dynamic-header';

export const dynamic = 'force-dynamic';

export default async function DashboardHeader() {
  return (
    <DynamicHeader
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={(
        <>
          <CreateGoalDialog />
        </>
      )}
    />
  );
}
