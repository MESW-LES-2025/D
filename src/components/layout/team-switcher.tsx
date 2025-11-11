'use client';
import { IconBuilding, IconPlus, IconSelector, IconWorldX } from '@tabler/icons-react';
import Image from 'next/image';
import * as React from 'react';

import { CreateOrgDialog } from '@/components/dialogs/create-org-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { client } from '@/lib/auth/auth-client';

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { data: session } = client.useSession();
  const { data: organizations, isPending } = client.useListOrganizations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  // Get active organization from session
  const activeOrgId = session?.session?.activeOrganizationId;
  const activeOrg = organizations?.find(org => org.id === activeOrgId) || organizations?.[0];

  // Show loading state
  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // Show no organizations state
  if (!organizations || organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isCreateDialogOpen ? false : undefined}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconWorldX className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">No Organizations</span>
                  <span className="truncate text-xs">Create one to start</span>
                </div>
                <IconSelector className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? 'bottom' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <IconPlus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Create organization</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateOrgDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            showTrigger={false}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // At this point we have organizations and activeOrg
  if (!activeOrg) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isCreateDialogOpen ? false : undefined}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeOrg.logo
                  ? (
                      <Image
                        src={activeOrg.logo}
                        alt={activeOrg.name}
                        width={32}
                        height={32}
                        className="size-full object-cover"
                      />
                    )
                  : (
                      <IconBuilding className="size-4" />
                    )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrg.name}</span>
                <span className="truncate text-xs">{activeOrg.slug}</span>
              </div>
              <IconSelector className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations?.map(org => (
              <DropdownMenuItem
                key={org.id}
                onClick={async () => {
                  await client.organization.setActive({
                    organizationId: org.id,
                  });
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border">
                  {org.logo
                    ? (
                        <Image
                          src={org.logo}
                          alt={org.name}
                          width={24}
                          height={24}
                          className="size-full object-cover"
                        />
                      )
                    : (
                        <IconBuilding className="size-3.5 shrink-0" />
                      )}
                </div>
                {org.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <IconPlus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add organization</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CreateOrgDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          showTrigger={false}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
