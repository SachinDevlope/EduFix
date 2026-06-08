import { promises as fs } from 'fs';
import path from 'path';
import { env } from '@/lib/env';
import { HttpError } from '@/lib/api/response';

export interface UploadedMedia {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  filename?: string;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function detectType(mime: string): 'image' | 'video' | null {
  if (IMAGE_TYPES.includes(mime)) return 'image';
  if (VIDEO_TYPES.includes(mime)) return 'video';
  return null;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

/**
 * Persist an uploaded file. Uses Cloudinary when configured, otherwise writes
 * to /public/uploads on local disk so the app works with zero configuration.
 */
export async function uploadFile(file: File): Promise<UploadedMedia> {
  const type = detectType(file.type);
  if (!type) {
    throw new HttpError(`Unsupported file type: ${file.type}`, 415);
  }
  const maxBytes = env.maxFileSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new HttpError(`File exceeds the ${env.maxFileSizeMb}MB limit`, 413);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const cfg = env.cloudinary;
  if (cfg) {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config(cfg);
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'edufix', resource_type: type === 'video' ? 'video' : 'image' },
          (error, res) => {
            if (error || !res) return reject(error ?? new Error('Upload failed'));
            resolve(res as { secure_url: string; public_id: string });
          },
        );
        stream.end(buffer);
      },
    );
    return { url: result.secure_url, type, publicId: result.public_id, filename: file.name };
  }

  // --- Local disk fallback ---
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitizeName(file.name)}`;
  await fs.writeFile(path.join(uploadsDir, unique), buffer);
  return { url: `/uploads/${unique}`, type, filename: file.name };
}
