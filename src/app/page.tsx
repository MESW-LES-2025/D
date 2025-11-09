import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'TaskUp',
  description: 'A simple task management app to boost your productivity.',
};

export default async function Home() {
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/sign-in');
  }
}
