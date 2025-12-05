'use client';

import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { EditMemberDialog } from '@/components/dialogs/edit-member-role-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type OrganizationUser = {
  memberId: string;
  id: string;
  name: string;
  role: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

type User = {
  id: string;
};

type RoleFilterProps = {
  users: OrganizationUser[];
  currentUser: User;
  hasPermissions: boolean;
};

export function RoleFilter({ users, currentUser, hasPermissions }: RoleFilterProps) {
  const [selectedRoles, setSelectedRoles] = useState({
    admin: true,
    owner: true,
    member: true,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on selected roles and search query
  const filteredUsers = users.filter((user) => {
    const matchesRole = selectedRoles[user.role as keyof typeof selectedRoles];

    const matchesSearch = searchQuery === ''
      || user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      || user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  const toggleRole = (role: keyof typeof selectedRoles) => {
    setSelectedRoles(prev => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  // Check if all roles are selected
  const allRolesSelected = selectedRoles.admin && selectedRoles.owner && selectedRoles.member;
  const hasActiveFilters = !allRolesSelected || searchQuery !== '';

  const clearSearch = () => {
    setSearchQuery('');
  };
  // --------------
  // const curRole = session.session.role;

  return (
    <div className="space-y-4">
      {/* Header with Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">
          All Team Members (
          {users.length}
          )
        </h2>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative max-w-sm flex-1">
            <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-10"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
              >
                <IconX size={16} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <IconAdjustmentsHorizontal className="h-4 w-4" />
                Filter
                {!allRolesSelected && (
                  <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg border bg-background p-4 shadow-lg"
              align="end"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Filter by Role</h3>
                <div className="space-y-3">
                  {(['admin', 'owner', 'member'] as const).map(role => (
                    <div key={role} className="flex items-center space-x-3">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles[role]}
                        onCheckedChange={() => toggleRole(role)}
                        className="border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                      />
                      <Label
                        htmlFor={`role-${role}`}
                        className="flex-1 cursor-pointer text-sm font-normal text-foreground capitalize"
                      >
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {!allRolesSelected && (
            <span className="inline-flex items-center gap-1">
              Roles:
              {Object.entries(selectedRoles)
                .filter(([_, isSelected]) => isSelected)
                .map(([role]) => role)
                .join(', ')}
            </span>
          )}
          {searchQuery && (
            <span>
              Search: "
              {searchQuery}
              "
            </span>
          )}
        </div>
      )}

      {/* Members Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredUsers.map(user => (
          <div key={user.memberId} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-1 items-center space-x-3">
                {user.image
                  ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="h-12 w-12 rounded-full"
                      />
                    )
                  : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                        <span className="text-lg font-medium">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-card-foreground">
                    {user.name || 'No name'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  {user.id === currentUser.id && (
                    <span className="mt-1 inline-block rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                      You
                    </span>
                  )}
                  <span className="mt-1 inline-block rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                    {user.role}
                  </span>
                </div>
              </div>
              <EditMemberDialog
                username={user.name || 'No name'}
                role={user.role}
                memberId={user.memberId}
              >
                {hasPermissions && (
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                )}
              </EditMemberDialog>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredUsers.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p>No members found with the current filters.</p>
          {hasActiveFilters && (
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('');
                setSelectedRoles({ admin: true, owner: true, member: true });
              }}
              className="mt-2"
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
