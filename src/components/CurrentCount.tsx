import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { counterTable } from '@/schema/counter';

export const CurrentCount = async () => {
  // `x-e2e-random-id` is used for end-to-end testing to make isolated requests
  // The default value is 0 when there is no `x-e2e-random-id` header
  const id = Number((await headers()).get('x-e2e-random-id')) || 0;
  const result = await db.query.counterTable.findFirst({
    where: eq(counterTable.id, id),
  });
  const count = result?.count ?? 0;

  return (
    <div>
      Count:
      {' '}
      {count}
    </div>
  );
};
