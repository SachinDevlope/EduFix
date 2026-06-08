'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Wrench, Loader2, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useStaff, useStaffMutations } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import { createStaffSchema, type CreateStaffInput } from '@/lib/validation';
import { STAFF_SPECIALIZATIONS } from '@/lib/constants';
import { initials } from '@/lib/utils';

export function AdminStaff() {
  const { data, isLoading } = useStaff();
  const { create, update } = useStaffMutations();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateStaffInput>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { name: '', email: '', phone: '', specialization: 'General Maintenance' },
  });

  async function onSubmit(values: CreateStaffInput) {
    try {
      await create.mutateAsync(values as unknown as Record<string, unknown>);
      toast({ title: 'Staff member added', description: 'Default password: Staff@123', variant: 'success' });
      reset();
      setOpen(false);
    } catch (err) {
      toast({ title: 'Could not add staff', description: err instanceof ApiError ? err.message : 'Error', variant: 'error' });
    }
  }

  function toggleStatus(id: string, current: string) {
    const next = current === 'active' ? 'inactive' : 'active';
    update.mutate(
      { id, payload: { status: next } },
      { onSuccess: () => toast({ title: `Staff ${next}`, variant: 'success' }) },
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{data?.items.length ?? 0} maintenance staff</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Maintenance Staff</DialogTitle>
                <DialogDescription>The new account uses default password <b>Staff@123</b>.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="s-name">Full name</Label>
                  <Input id="s-name" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-email">Email</Label>
                  <Input id="s-email" type="email" {...register('email')} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-phone">Phone</Label>
                    <Input id="s-phone" {...register('phone')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Specialization</Label>
                    <Controller
                      control={control}
                      name="specialization"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STAFF_SPECIALIZATIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={create.isPending}>
                    {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Add Staff
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState icon={Wrench} title="No staff yet" description="Add maintenance staff to assign repairs." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Active Assignments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                        {initials(s.name)}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{s.specialization}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={s.activeAssignments > 3 ? 'warning' : 'default'}>{s.activeAssignments} active</Badge>
                  </TableCell>
                  <TableCell><Badge variant={s.status === 'active' ? 'success' : 'destructive'}>{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(s._id, s.status)} disabled={update.isPending}>
                      <Power className="h-4 w-4" />
                      {s.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
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
