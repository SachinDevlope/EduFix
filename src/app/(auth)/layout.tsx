import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';

const POINTS = [
  'Report issues with photo & video evidence',
  'Track every repair in real time',
  'Transparent, accountable workflow',
  'Insightful analytics for administrators',
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Marketing panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Logo href="/" className="text-primary-foreground [&_span]:text-primary-foreground" />
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Safer schools start with better facility management.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Join the EduFix portal to report, track and resolve infrastructure issues across your
            school — all in one transparent platform.
          </p>
          <ul className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-primary-foreground/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} EduFix. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Logo href="/" className="lg:hidden" />
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
