import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AvatarUpdateCard } from '@/app/(main)/settings/account/_components/avatar-update-card';
import { NameUpdateCard } from '@/app/(main)/settings/account/_components/name-update-card';
import { PasswordUpdateCard } from '@/app/(main)/settings/account/_components/password-update-card';
import { auth } from '@/lib/auth/auth';
import { DeleteAccountCard } from './_components/delete-account-card';

export const metadata: Metadata = {
  title: 'TaskUp | Account',
  description: 'Manage your account settings',
};

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/settings/account');
  }

  return (
    <div className="flex-1 space-y-6 xl:max-w-4xl">
      <AvatarUpdateCard />
      <NameUpdateCard />
      <PasswordUpdateCard />
      <DeleteAccountCard />
    </div>
  );
}
