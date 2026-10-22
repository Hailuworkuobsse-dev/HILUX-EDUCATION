import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  GraduationCap,
  MessageSquare,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Container';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

const SUBJECTS = [
  { icon: Brain, name: 'Mathematics' },
  { icon: BookOpen, name: 'English' },
  { icon: Zap, name: 'Physics' },
  { icon: Target, name: 'Chemistry' },
  { icon: GraduationCap, name: 'Biology' },
  { icon: Trophy, name: 'Geography' }
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant grading',
    text: 'See correct answers and full explanations the moment you submit.'
  },
  {
    icon: Brain,
    title: 'Spaced repetition',
    text: 'We resurface questions you struggled with at exactly the right time.'
  },
  {
    icon: Target,
    title: 'Topic analytics',
    text: 'Identify your weakest topics and focus your practice where it matters.'
  },
  {
    icon: Users,
    title: 'Real mentors',
    text: 'Chat with top students who aced these exams and can guide you.'
  },
  {
    icon: Trophy,
    title: 'Track progress',
    text: 'Streaks, mastery, and score trends keep you motivated.'
  },
  {
    icon: MessageSquare,
    title: 'Works offline',
    text: 'Install once, practice anywhere — even without a stable connection.'
  }
];

const STEPS = [
  { number: 1, title: 'Sign up free', text: `Get ${APP.TRIAL_DAYS} days of full access. No card required.` },
  { number: 2, title: 'Practice daily', text: 'Short sessions with real MCQ papers from past exams.' },
  { number: 3, title: 'Watch your score climb', text: 'Focus on weak topics. Confirm mastery. Walk in confident.' }
];

const TESTIMONIALS = [
  {
    quote:
      'I went from 45% to 82% on my math mock exams. The weak-topic drill was a game-changer.',
    name: 'Selam T.',
    role: 'Grade 10 · Addis Ababa'
  },
  {
    quote:
      'Being able to practice on my phone during the commute made all the difference. No more excuses.',
    name: 'Yohannes A.',
    role: 'Grade 10 · Bahir Dar'
  },
  {
    quote:
      'My mentor answered my questions at 9pm on a Sunday. That kind of support is unreal.',
    name: 'Hanna M.',
    role: 'Grade 10 · Hawassa'
  }
];

const FAQ = [
  {
    q: `Is it really free for ${APP.TRIAL_DAYS} days?`,
    a: `Yes. Every student gets full access for ${APP.TRIAL_DAYS} days — all subjects, all papers, no restrictions. No card is required to start.`
  },
  {
    q: `What happens after the trial?`,
    a: `After ${APP.TRIAL_DAYS} days, each course is ${APP.PRICE_PER_COURSE} ${APP.CURRENCY} for unlimited access. You can subscribe to as many or as few courses as you need.`
  },
  {
    q: 'How do I pay?',
    a: 'We support Telebirr, CBE Birr, and Chapa — all local Ethiopian payment methods. Your access is activated instantly.'
  },
  {
    q: 'Do I need a laptop?',
    a: 'No. ExamPrep is designed mobile-first. Install it as an app on your phone and practice anywhere.'
  }
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      {/* Hero */}
      <Container className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
            <Sparkles className="h-3.5 w-3.5" />
            Free for {APP.TRIAL_DAYS} days — no card required
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Ace your Grade&nbsp;10 exams{' '}
            <span className="gradient-text">on your phone</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-fg-muted sm:text-lg">
            Practice with real MCQ papers, track your weak topics, and get mentored by top
            students. Then keep going for just {APP.CURRENCY} {APP.PRICE_PER_COURSE} per course.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              <Link to={ROUTES.REGISTER}>Start free</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to={ROUTES.LOGIN}>Sign in</Link>
            </Button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-fg-subtle">
            <Star className="h-3 w-3 fill-warning text-warning" />
            Loved by 10,000+ students across Ethiopia
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: '10,000+', label: 'Students' },
            { value: '12', label: 'Subjects' },
            { value: '50+', label: 'Exam papers' },
            { value: '4.8/5', label: 'Avg rating' }
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold gradient-text sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-fg-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* How it works */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Three steps to walk into your exam prepared.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="rounded-2xl border border-border bg-bg-surface/60 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300 font-bold">
                {step.number}
              </div>
              <p className="text-base font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-fg-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Subjects */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">All your subjects, one app</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Every subject that appears in the national exam.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SUBJECTS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-surface/60 p-4 text-center"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-medium">{s.name}</p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Features */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Built for how you actually study</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Every feature exists for one goal: helping you pass.
          </p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-bg-surface/60 p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs text-fg-muted">{f.text}</p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* Pricing */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Simple pricing</h2>
          <p className="mt-2 text-sm text-fg-muted">Try everything free. Pay only when you love it.</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg-surface/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Free trial</p>
            <p className="mt-2 text-4xl font-extrabold">0 ETB</p>
            <p className="mt-1 text-sm text-fg-muted">First {APP.TRIAL_DAYS} days</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                'All subjects unlocked',
                'All exam papers',
                'Full analytics',
                'No credit card'
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild fullWidth className="mt-6">
              <Link to={ROUTES.REGISTER}>Start free</Link>
            </Button>
          </div>

          <div className="relative rounded-2xl border-2 border-brand-500/50 bg-gradient-to-br from-brand-500/10 to-transparent p-6 shadow-glow">
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                POPULAR
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              After trial
            </p>
            <p className="mt-2 text-4xl font-extrabold">
              {APP.PRICE_PER_COURSE} <span className="text-lg text-fg-muted">{APP.CURRENCY}</span>
            </p>
            <p className="mt-1 text-sm text-fg-muted">Per course · unlimited access</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                'Everything in trial',
                'Mentor support',
                'Spaced repetition',
                'Priority new papers'
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button asChild fullWidth className="mt-6">
              <Link to={ROUTES.REGISTER}>
                <Rocket className="mr-2 h-4 w-4" /> Get started
              </Link>
            </Button>
          </div>
        </div>
      </Container>

      {/* Testimonials */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Students love it</h2>
          <p className="mt-2 text-sm text-fg-muted">Real words from real Grade 10 students.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-bg-surface/60 p-5">
              <div className="mb-2 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-fg">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-medium">{t.name}</p>
              <p className="text-[10px] text-fg-muted">{t.role}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* FAQ */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Questions?</h2>
          <div className="mt-8 space-y-2">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-bg-surface/60"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 text-sm font-medium">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-fg-muted transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border px-4 py-3 text-sm text-fg-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </Container>

      {/* Final CTA */}
      <Container className="relative py-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/15 via-transparent to-accent-500/10 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-4xl">
            Your exam is closer than you think.
          </h2>
          <p className="mt-3 text-sm text-fg-muted sm:text-base">
            Start free today. {APP.TRIAL_DAYS} days of full access, no card required.
          </p>
          <Button asChild size="lg" className="mt-6" rightIcon={<ArrowRight className="h-4 w-4" />}>
            <Link to={ROUTES.REGISTER}>Start free</Link>
          </Button>
        </div>
      </Container>

      <footer className="border-t border-border bg-bg-surface/30 py-8">
        <Container>
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-fg-muted sm:flex-row">
            <p>© {new Date().getFullYear()} ExamPrep. Made for Ethiopian students.</p>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-fg">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-fg">
                Privacy
              </Link>
              <Link to="/support" className="hover:text-fg">
                Support
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
