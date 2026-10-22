import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/ui/PageMeta';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

const FAQ = [
  {
    q: 'How do I reset my password?',
    a: 'Click "Forgot password?" on the sign-in page and follow the email/SMS link.'
  },
  {
    q: 'How do I pay for a course?',
    a: 'Open the course, click "See plans", then pick a course and pay via Telebirr, CBE Birr, or Chapa.'
  },
  {
    q: 'My payment went through but I still see "locked"',
    a: 'Refresh the page. If it still shows locked after 5 minutes, contact support with your order ID.'
  },
  {
    q: 'Can I get a refund?',
    a: "Yes, within 7 days of purchase if you haven't used the course much. Email support with your order ID."
  },
  {
    q: 'How do I become a mentor?',
    a: 'Register as a student, then contact support. We vet mentors before onboarding.'
  },
  {
    q: 'Can I use the app on a laptop?',
    a: 'Yes. It is designed mobile-first but works on any modern browser.'
  }
];

export default function SupportPage() {
  return (
    <Container size="md" className="py-10">
      <PageMeta title="Support" description={`Get help with ${APP.NAME}`} />
      <PageHeader title="Support" description="We're here to help." />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <Mail className="mb-2 h-5 w-5 text-brand-300" />
          <p className="text-sm font-semibold">Email</p>
          <a
            href="mailto:support@examprep.local"
            className="text-xs text-brand-300 hover:underline"
          >
            support@examprep.local
          </a>
          <p className="mt-1 text-[11px] text-fg-subtle">Replies within 24h</p>
        </Card>
        <Card className="p-4">
          <Phone className="mb-2 h-5 w-5 text-brand-300" />
          <p className="text-sm font-semibold">Phone</p>
          <p className="text-xs text-fg-muted">+251 900 000 000</p>
          <p className="mt-1 text-[11px] text-fg-subtle">Mon–Fri, 9am–5pm EAT</p>
        </Card>
        <Card className="p-4">
          <MessageSquare className="mb-2 h-5 w-5 text-brand-300" />
          <p className="text-sm font-semibold">In-app chat</p>
          <p className="text-xs text-fg-muted">Ask your mentor</p>
          <p className="mt-1 text-[11px] text-fg-subtle">If you've been assigned one</p>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Frequently asked</h2>
      <div className="space-y-2">
        {FAQ.map((item) => (
          <details key={item.q} className="rounded-xl border border-border bg-bg-surface/60">
            <summary className="cursor-pointer p-4 text-sm font-medium">{item.q}</summary>
            <div className="border-t border-border px-4 py-3 text-sm text-fg-muted">{item.a}</div>
          </details>
        ))}
      </div>

      <div className="mt-8 flex gap-2">
        <Button asChild variant="secondary">
          <Link to={ROUTES.HOME}>Back to home</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to={ROUTES.LOGIN}>Sign in</Link>
        </Button>
      </div>
    </Container>
  );
}
