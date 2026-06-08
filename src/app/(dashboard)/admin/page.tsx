'use client';

import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { AdminIssues } from '@/components/admin/admin-issues';
import { AdminUsers } from '@/components/admin/admin-users';
import { AdminStaff } from '@/components/admin/admin-staff';
import { AdminReports } from '@/components/admin/admin-reports';

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  if (!isLoading && user && user.role !== 'admin') redirect('/dashboard');

  return (
    <div>
      <PageHeader
        title="Admin Panel"
        description="Manage issues, users, maintenance staff and generate reports."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <ShieldCheck className="h-4 w-4" /> Administrator
        </span>
      </PageHeader>

      <Tabs defaultValue="issues">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="issues"><AdminIssues /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="staff"><AdminStaff /></TabsContent>
        <TabsContent value="reports"><AdminReports /></TabsContent>
      </Tabs>
    </div>
  );
}
