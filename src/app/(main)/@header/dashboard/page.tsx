import { CreateGoalHeaderButton } from '@/components/goals/CreateGoalHeaderButton';
import { DynamicHeader } from '@/components/layout/dynamic-header';

export const dynamic = 'force-dynamic';

export default async function DashboardHeader() {
  return (
    <DynamicHeader
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={(
        <>
          <CreateGoalHeaderButton />
        </>
      )}
    />
  );
}
