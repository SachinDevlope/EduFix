'use client';

import * as React from 'react';
import Image from 'next/image';
import { UploadCloud, X, FileVideo, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Media } from '@/types';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';
const MAX = 10;

export function MediaUploader({
  value,
  onChange,
  disabled,
}: {
  value: Media[];
  onChange: (media: Media[]) => void;
  disabled?: boolean;
}) {
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > MAX) {
      toast({ title: 'Too many files', description: `You can upload up to ${MAX} files.`, variant: 'error' });
      return;
    }
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    setUploading(true);
    try {
      const { media } = await api.upload<{ media: Media[] }>('/api/upload', formData);
      onChange([...value, ...media]);
      toast({ title: 'Upload complete', description: `${media.length} file(s) added.`, variant: 'success' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof ApiError ? err.message : 'Could not upload files',
        variant: 'error',
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition',
          dragging ? 'border-primary bg-primary/5' : 'hover:border-primary/50',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="mt-2 text-sm font-medium">
          {uploading ? 'Uploading…' : 'Click or drag files to upload'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images & videos · up to {MAX} files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {value.map((m, idx) => (
            <div key={`${m.url}-${idx}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              {m.type === 'image' ? (
                <Image src={m.url} alt={m.filename ?? 'evidence'} fill sizes="120px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                  <FileVideo className="h-7 w-7" />
                  <span className="px-1 text-[10px]">Video</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
