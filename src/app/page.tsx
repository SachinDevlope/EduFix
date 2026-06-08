import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  Image as ImageIcon,
  ShieldCheck,
  Users,
  Zap,
  ArrowRight,
  Star,
} from 'lucide-react';
import { LandingNav } from '@/components/landing/landing-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';

const FEATURES = [
  { icon: ClipboardList, title: 'Easy Issue Reporting', desc: 'Report broken furniture, electrical faults, sanitation and safety hazards in seconds.' },
  { icon: ImageIcon, title: 'Photo & Video Evidence', desc: 'Attach images and videos so maintenance teams understand the problem instantly.' },
  { icon: Bell, title: 'Real-Time Notifications', desc: 'Stay informed at every step — assignment, progress and resolution updates.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track resolution rates, response times and category trends with rich charts.' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Secure access for Parents, Teachers, Staff and Administrators.' },
  { icon: Zap, title: 'Repair Tracking', desc: 'Follow each issue through its full lifecycle with timelines and activity logs.' },
];

const STEPS = [
  { num: '01', title: 'Report the Issue', desc: 'Describe the problem, add location and upload photos or videos as evidence.' },
  { num: '02', title: 'Admin Assigns Staff', desc: 'Administrators review, set priority and assign the right maintenance staff.' },
  { num: '03', title: 'Track the Repair', desc: 'Watch progress in real time through a transparent status timeline.' },
  { num: '04', title: 'Issue Resolved', desc: 'Get notified the moment the issue is fixed, with resolution notes.' },
];

const STATS = [
  { value: '8+', label: 'Issue Categories' },
  { value: '4', label: 'User Roles' },
  { value: '100%', label: 'Transparent Workflow' },
  { value: '24/7', label: 'Always Accessible' },
];

const BENEFITS = [
  'Centralized reporting across the entire campus',
  'Faster response times and timely maintenance',
  'Improved transparency and accountability',
  'Safer learning environment for students',
  'Data-driven decisions with analytics',
  'Complete audit trail for every issue',
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'School Principal', quote: 'EduFix transformed how we manage repairs. Nothing falls through the cracks anymore.' },
  { name: 'Rahul Mehta', role: 'Parent', quote: 'I reported a broken playground swing and got updates until it was fixed. Brilliant transparency.' },
  { name: 'Anita Reddy', role: 'Teacher', quote: 'Reporting a faulty classroom fan takes seconds. The team is notified instantly.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container flex flex-col items-center py-20 text-center md:py-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Government-ready · Secure · Transparent
          </span>
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Report & Resolve <span className="text-primary">School Facility</span> Issues with Confidence
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A centralized portal for parents, teachers and administrators to report infrastructure
            problems, upload evidence, and track repairs from report to resolution.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Report an Issue <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Login to Dashboard</Link>
            </Button>
          </div>

          <div className="mt-16 grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to manage facilities"
          subtitle="Purpose-built for schools to keep infrastructure safe and well-maintained."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y bg-muted/40">
        <div className="container py-20">
          <SectionHeading
            eyebrow="How it works"
            title="From report to resolution in four steps"
            subtitle="A simple, transparent workflow that keeps everyone informed."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.num} className="relative rounded-xl border bg-card p-6 shadow-sm">
                <span className="text-3xl font-extrabold text-primary/30">{s.num}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="container py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Benefits</p>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Build a safer, better-maintained campus
            </h2>
            <p className="mt-4 text-muted-foreground">
              EduFix brings accountability and speed to facility maintenance, ensuring issues are
              never forgotten and students always learn in a safe environment.
            </p>
            <ul className="mt-6 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: AlertTriangle, title: 'Critical alerts', text: 'High-priority hazards surface immediately.' },
              { icon: Users, title: 'Everyone involved', text: 'Parents, teachers, staff & admins on one platform.' },
              { icon: BarChart3, title: 'Clear insights', text: 'Understand trends and bottlenecks at a glance.' },
              { icon: Bell, title: 'Never miss an update', text: 'Real-time notifications keep you in the loop.' },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent className="pt-6">
                  <c.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-3 font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y bg-muted/40">
        <div className="container py-20">
          <SectionHeading
            eyebrow="Testimonials"
            title="Trusted by school communities"
            subtitle="Hear from the people who keep schools running."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name}>
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="container py-20">
        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
            <h2 className="max-w-2xl text-3xl font-bold">
              Ready to make your school safer and better maintained?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Create a free account as a parent or teacher and start reporting issues today.
              Administrators can manage everything from a single powerful dashboard.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">Create an Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:support@edufix.edu">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} EduFix — School Facility Reporting Portal.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">Login</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
