import { DynamicHeader } from '@/components/layout/dynamic-header';
import { userTable } from '@/schema/user';
import { db } from '@/lib/db';
import { CreateTaskButton } from '@/components/tasks/CreateTaskButton';

export default async function DashboardHeader() {
  const users = await db.select({
    id: userTable.id,
    name: userTable.name,
    email: userTable.email,
  }).from(userTable);
  return (
    <DynamicHeader
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={(
          <CreateTaskButton users={users} />
      )}
    />
  );
}
