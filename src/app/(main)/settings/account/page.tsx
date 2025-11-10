import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AvatarUpdateCard } from '@/app/(main)/settings/account/_components/avatar-update-card';
import { NameUpdateCard } from '@/app/(main)/settings/account/_components/name-update-card';
import { PasswordUpdateCard } from '@/app/(main)/settings/account/_components/password-update-card';
import { Separator } from '@/components/ui/separator';
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <Separator />

      <AvatarUpdateCard />
      <NameUpdateCard />
      <PasswordUpdateCard />
      <DeleteAccountCard />
    </div>
  );
}
