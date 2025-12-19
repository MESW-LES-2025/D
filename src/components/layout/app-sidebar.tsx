'use client';

import {
  IconDashboard,
  IconListCheck,
  IconSettings,
  IconTicket,
  IconUserShare,
} from '@tabler/icons-react';
import * as React from 'react';
import { NavMain } from '@/components/layout/nav-main';
import { NavSecondary } from '@/components/layout/nav-secondary';
import { TeamSwitcher } from '@/components/layout/team-switcher';
import { UserDropdown } from '@/components/layout/user-dropdown';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: IconDashboard,
    },
    {
      title: 'Tasks',
      url: 'tasks',
      icon: IconListCheck,
    },
    {
      title: 'Team',
      url: 'team',
      icon: IconUserShare,
    },
    {
      title: 'Rewards',
      url: 'rewards',
      icon: IconTicket,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: 'settings',
      icon: IconSettings,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  earnedPoints?: number;
};

export function AppSidebar({ earnedPoints = 0, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserDropdown earnedPoints={earnedPoints} />
      </SidebarFooter>
    </Sidebar>
  );
}
