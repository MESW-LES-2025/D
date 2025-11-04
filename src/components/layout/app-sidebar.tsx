'use client';

import {
  IconChartDots3Filled,
  IconChartRadar,
  IconDashboard,
  IconSettings,
  IconSpaces,
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
  teams: [
    {
      name: 'Acme Inc',
      logo: IconSpaces,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: IconChartDots3Filled,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: IconChartRadar,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: IconDashboard,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
