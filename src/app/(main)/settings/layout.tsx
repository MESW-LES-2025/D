import { IconUser } from '@tabler/icons-react';
import React from 'react';

import { SettingsNav } from '@/components/layout/settings-nav';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
  {
    title: 'Account',
    href: '/settings/account',
    icon: <IconUser size={18} />,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="@container/main flex flex-1 flex-col gap-6 px-8 py-4 xl:px-32 xl:py-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Settings
      </h1>
      <Separator />

      <div className="flex flex-1 flex-col space-y-8 xl:flex-row xl:space-y-0 xl:space-x-12">
        <aside className="xl:w-1/5">
          <SettingsNav
            items={sidebarNavItems}
            className="[&_a:hover]:no-underline"
          />
        </aside>
        <div className="flex-1 space-y-6 xl:max-w-4xl">{children}</div>
      </div>
    </main>
  );
}
