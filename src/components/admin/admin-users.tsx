'use client';

import * as React from 'react';
import { Search, Users as UsersIcon, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { useUsers, useToggleUserStatus } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { formatDate, initials } from '@/lib/utils';

const ALL = 'all';
const ROLE_LABEL: Record<string, string> = { admin: 'Admin', teacher: 'Teacher', parent: 'Parent', staff: 'Staff' };

export function AdminUsers() {
  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [role, setRole] = React.useState(ALL);
  const { toast } = useToast();

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useUsers({
    search: debounced || undefined,
    role: role === ALL ? undefined : role,
  });
  const toggle = useToggleUserStatus();

  function toggleStatus(id: string, current: string) {
    const next = current === 'active' ? 'inactive' : 'active';
    toggle.mutate(
      { id, status: next },
      {
        onSuccess: () => toast({ title: `User ${next === 'active' ? 'activated' : 'deactivated'}`, variant: 'success' }),
        onError: () => toast({ title: 'Could not update user', variant: 'error' }),
      },
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Roles</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{ROLE_LABEL[u.role] ?? u.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'active' ? 'success' : 'destructive'}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {u.role !== 'admin' && (
                      <Button
                        variant={u.status === 'active' ? 'outline' : 'success'}
                        size="sm"
                        onClick={() => toggleStatus(u._id, u.status)}
                        disabled={toggle.isPending}
                      >
                        <Power className="h-4 w-4" />
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
