import { DynamicHeader } from '@/components/layout/dynamic-header';
import { CreateTaskButton } from '@/components/tasks/CreateTaskButton';
import { db } from '@/lib/db';
import { userTable } from '@/schema/user';

export const dynamic = 'force-dynamic';

export default async function DashboardHeader() {
  type User = {
    id: string;
    name: string;
    email: string;
  };

  let users: User[] = [];

  try {
    users = await db.select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
    }).from(userTable);
  } catch (error) {
    console.warn('Database not ready or table missing, returning empty users', error);
  }

  return (
    <DynamicHeader
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={<CreateTaskButton users={users} />}
    />
  );
}
