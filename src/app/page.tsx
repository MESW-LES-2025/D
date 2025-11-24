import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'TaskUp',
  description: 'A simple task management app to boost your productivity.',
};

export default function Home() {
  // Redirect to the dashboard while we don't have a landing page yet
  redirect('/dashboard');
}
