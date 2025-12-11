import type { Notification } from '@/lib/notification/notification-types';

import Link from 'next/link';
import React from 'react';
import { ModeToggle } from '@/components/common/mode-toggle';
import { NotificationsPopover } from '@/components/common/notifications-popover';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

type BreadcrumbItemType = {
  label: string;
  href?: string;
};

type DataType = {
  notifications: Notification[];
};

type DynamicHeaderProps = {
  breadcrumbs: BreadcrumbItemType[];
  data?: DataType;
  actions?: React.ReactNode;
};

export function DynamicHeader({ breadcrumbs, data, actions }: DynamicHeaderProps) {
  const lastIndex = breadcrumbs.length - 1;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-5"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, idx) => {
              const isLast = idx === lastIndex;
              return (
                <React.Fragment key={item.href ?? item.label + idx}>
                  <BreadcrumbItem>
                    {isLast
                      ? (
                          <BreadcrumbPage className="max-w-40 truncate capitalize md:max-w-none">
                            {item.label}
                          </BreadcrumbPage>
                        )
                      : item.href
                        ? (
                            <BreadcrumbLink
                              asChild
                              className="max-w-40 truncate capitalize md:max-w-none"
                            >
                              <Link href={item.href}>{item.label}</Link>
                            </BreadcrumbLink>
                          )
                        : (
                            <BreadcrumbPage className="max-w-40 truncate capitalize md:max-w-none">
                              {item.label}
                            </BreadcrumbPage>
                          )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page-specific actions slot */}
        <div className="ml-auto flex items-center gap-2">
          {actions}

          <NotificationsPopover notifications={data?.notifications ?? []} />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
