'use client';

import {
  CheckSquare,
  Home,
  LogOut,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const topLinks: SidebarLink[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/rewards',
    label: 'Rewards',
    icon: <Trophy className="h-5 w-5" />,
  },
];

const bottomLinks: SidebarLink[] = [
  {
    href: '/account',
    label: 'Profile',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/sign-in',
    label: 'Logout',
    icon: <LogOut className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 border-b px-6">
        <Logo url="/" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col justify-between p-4">
        {/* Top Links */}
        <div className="space-y-1">
          {topLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Bottom Links */}
        <div className="space-y-1 border-t pt-4">
          {bottomLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
