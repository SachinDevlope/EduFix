'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { createIssueSchema, type CreateIssueInput } from '@/lib/validation';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES } from '@/lib/constants';
import { useCreateIssue } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaUploader } from '@/components/media-uploader';
import { cn } from '@/lib/utils';
import type { Media } from '@/types';

const PRIORITY_STYLES: Record<string, string> = {
  Low: 'border-muted-foreground/30',
  Medium: 'border-primary',
  High: 'border-warning',
  Critical: 'border-destructive',
};

export default function ReportIssuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createIssue = useCreateIssue();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateIssueInput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Other',
      building: '',
      floor: '',
      roomNumber: '',
      priority: 'Medium',
      media: [],
    },
  });

  const media = (watch('media') ?? []) as Media[];
  const priority = watch('priority');

  async function onSubmit(values: CreateIssueInput) {
    try {
      const { issue } = await createIssue.mutateAsync(values as unknown as Record<string, unknown>);
      toast({
        title: 'Issue reported',
        description: `${issue.issueCode} has been submitted successfully.`,
        variant: 'success',
      });
      router.push(`/tracking?issue=${issue._id}`);
    } catch (err) {
      toast({
        title: 'Could not submit issue',
        description: err instanceof ApiError ? err.message : 'Something went wrong',
        variant: 'error',
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Report an Issue" description="Describe the facility problem and add evidence." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Issue Title</Label>
              <Input id="title" placeholder="e.g. Broken ceiling fan in Room 204" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the problem, when you noticed it, and any safety concerns…"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="building">Building</Label>
              <Input id="building" placeholder="Main Block" {...register('building')} />
              {errors.building && <p className="text-xs text-destructive">{errors.building.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" placeholder="2nd" {...register('floor')} />
              {errors.floor && <p className="text-xs text-destructive">{errors.floor.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" placeholder="R-204" {...register('roomNumber')} />
              {errors.roomNumber && <p className="text-xs text-destructive">{errors.roomNumber.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ISSUE_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue('priority', p)}
                  className={cn(
                    'rounded-lg border-2 p-3 text-sm font-medium transition',
                    priority === p ? cn(PRIORITY_STYLES[p], 'bg-muted/50') : 'border-border hover:bg-muted/40',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence (Images & Videos)</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader value={media} onChange={(m) => setValue('media', m)} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/tracking')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createIssue.isPending}>
            {createIssue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Issue
          </Button>
        </div>
      </form>
    </div>
  );
}
