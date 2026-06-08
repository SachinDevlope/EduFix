'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuthUser } from '@/types';

const DEMO = [
  { label: 'Admin', email: 'admin@edufix.edu', password: 'Admin@123' },
  { label: 'Teacher', email: 'teacher1@edufix.edu', password: 'Password@123' },
  { label: 'Parent', email: 'parent1@edufix.edu', password: 'Password@123' },
  { label: 'Staff', email: 'staff1@edufix.edu', password: 'Staff@123' },
];

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const { user } = await api.post<{ user: AuthUser }>('/api/auth/login', values);
      setUser(user);
      toast({ title: 'Welcome back!', description: `Signed in as ${user.name}.`, variant: 'success' });
      router.push(params.get('redirect') || '/dashboard');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Login failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong',
        variant: 'error',
      });
    }
  }

  function fillDemo(email: string, password: string) {
    setValue('email', email);
    setValue('password', password);
  }

  return (
    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@school.edu" autoComplete="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input" {...register('remember')} />
            Remember me
          </label>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-dashed bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground">Demo accounts — click to autofill:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO.map((d) => (
              <button
                key={d.label}
                type="button"
                onClick={() => fillDemo(d.email, d.password)}
                className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium transition hover:border-primary hover:text-primary"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
