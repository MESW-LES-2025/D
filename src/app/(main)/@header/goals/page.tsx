import { DynamicHeader } from '@/components/layout/dynamic-header';
import { CreateGoalHeaderButton } from '@/components/goals/CreateGoalHeaderButton';

export const dynamic = 'force-dynamic';

export default async function GoalsHeader() {
  const breadcrumbs = [{ label: 'Goals' }];

  return (
    <DynamicHeader
      breadcrumbs={breadcrumbs}
      actions={<CreateGoalHeaderButton />}
    />
  );
}
