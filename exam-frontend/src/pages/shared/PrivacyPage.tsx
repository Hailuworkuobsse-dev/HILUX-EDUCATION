import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/ui/PageMeta';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

export default function PrivacyPage() {
  return (
    <Container size="md" className="py-10">
      <PageMeta title="Privacy Policy" description={`How ${APP.NAME} handles your data`} />
      <PageHeader title="Privacy Policy" description="Your data, your control." />

      <div className="prose prose-invert max-w-none space-y-5 text-sm text-fg-muted">
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">What we collect</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Account info: name, email, phone number, password (hashed)</li>
            <li>Practice data: your attempts, answers, and scores</li>
            <li>Technical: device type, IP address (for security and rate limiting)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">How we use it</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>To run the platform — grading, analytics, spaced repetition</li>
            <li>To let mentors help you (only with mentees you are matched to)</li>
            <li>To send you important updates (trial reminders, payment receipts)</li>
            <li>To improve the platform (aggregated, anonymized analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">What we never do</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>We never sell your data</li>
            <li>We never share your practice performance publicly</li>
            <li>We never send marketing SMS without your explicit opt-in</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Your rights</h2>
          <p>
            You can export all your data at any time from Settings. You can also delete your
            account — this removes your profile, attempts, and enrollments. Payment records are
            retained for legal compliance.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">Children</h2>
          <p>
            Most of our users are under 18. We minimize data collection and never show ads. If
            you're a parent and want to review or delete your child's account, contact support.
          </p>
        </section>

        <div className="pt-4">
          <Button asChild variant="ghost">
            <Link to={ROUTES.HOME}>Back to home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
