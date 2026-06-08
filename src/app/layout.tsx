import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { getSession } from '@/lib/auth/session';
import { getUserById } from '@/services/auth.service';
import { connectDB } from '@/lib/db';
import type { AuthUser } from '@/types';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'EduFix — School Facility Reporting & Repair Tracking Portal',
    template: '%s · EduFix',
  },
  description:
    'Report, track, and resolve school infrastructure issues with transparency and accountability.',
  keywords: ['school', 'facility', 'maintenance', 'repair tracking', 'education'],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
};

async function loadInitialUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    await connectDB();
    return await getUserById(session.id);
  } catch {
    return null;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialUser = await loadInitialUser();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
