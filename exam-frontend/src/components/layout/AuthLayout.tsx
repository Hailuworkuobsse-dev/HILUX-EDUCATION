import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Zap } from 'lucide-react';
import { Container } from './Container';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="relative grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-border/50 bg-bg-surface/40 p-10 lg:flex">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
              E
            </span>
            ExamPrep
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold leading-tight">
              Your practice, <span className="gradient-text">your pace</span>,
              <br />
              your success.
            </h2>
            <p className="mt-3 max-w-md text-sm text-fg-muted">
              Practice real MCQ papers, track weak topics, and get mentored — free for{' '}
              {APP.TRIAL_DAYS} days.
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                { icon: Zap, text: 'Instant grading & explanations' },
                { icon: Trophy, text: 'Spaced repetition built-in' },
                { icon: Sparkles, text: 'Mentors who aced these exams' }
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-fg-subtle">
            © {new Date().getFullYear()} {APP.NAME}. Built for Ethiopian students.
          </p>
        </div>
        <div className="flex items-center justify-center p-4 sm:p-8">
          <Container size="sm" className="px-0">
            {children}
          </Container>
        </div>
      </div>
    </div>
  );
}
