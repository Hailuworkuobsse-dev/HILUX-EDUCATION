import { Link } from 'react-router-dom';
import { Container } from '@/components/layout/Container';
import { PageMeta } from '@/components/ui/PageMeta';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

export default function TermsPage() {
  return (
    <Container size="md" className="py-10">
      <PageMeta title="Terms of Service" description={`Terms of using ${APP.NAME}`} />
      <PageHeader
        title="Terms of Service"
        description={`Effective ${new Date().toLocaleDateString()}`}
      />

      <div className="prose prose-invert max-w-none space-y-5 text-sm text-fg-muted">
        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">1. Acceptance</h2>
          <p>
            By creating an account on {APP.NAME}, you agree to these terms. If you are under 18,
            you confirm you have permission from a parent or guardian.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">2. Free trial</h2>
          <p>
            New accounts receive {APP.TRIAL_DAYS} days of full access with no payment required.
            After the trial, each course is {APP.PRICE_PER_COURSE} {APP.CURRENCY} for unlimited
            access to that course's content.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">3. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Share your account with anyone else</li>
            <li>Attempt to scrape, copy, or redistribute the question bank</li>
            <li>Harass mentors or other users</li>
            <li>Attempt to bypass payment or the trial period</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">4. Content accuracy</h2>
          <p>
            All questions are authored and reviewed by teachers. If you spot an error, please
            flag it — we review every report.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">5. Payments &amp; refunds</h2>
          <p>
            Payments are processed via local providers (Telebirr, CBE Birr, Chapa). Refunds are
            available within 7 days of purchase if the course has not been substantially used —
            contact support.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-fg">6. Termination</h2>
          <p>
            You may delete your account at any time from Settings. We may suspend accounts that
            violate these terms.
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
