import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, Select } from '@/components/ui';
import { PaymentModal } from '@/features/payments/PaymentModal';
import { useCourses } from '@/features/student/hooks';
import { useToast } from '@/hooks/useToast';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

export default function SubscribePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const courses = useCourses();
  const [subjectId, setSubjectId] = useState<string>(params.get('subjectId') ?? '');
  const [open, setOpen] = useState(false);

  const lockedCourses = (courses.data ?? []).filter(
    (c) => c.subscriptionStatus === 'none' || c.subscriptionStatus === 'expired'
  );
  const selected = (courses.data ?? []).find((c) => c.id === subjectId);
  const options = lockedCourses.map((c) => ({ value: c.id, label: c.name }));

  const handleOpen = () => {
    if (!subjectId) {
      toast.error('Pick a course first');
      return;
    }
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscribe"
        description="Unlock unlimited practice per course and keep your momentum going."
      />

      <Card className="relative overflow-hidden p-6">
        <div className="absolute right-4 top-4">
          <Badge tone="brand" dot>
            Best value
          </Badge>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> Per course
            </p>
            <p className="mt-2 text-4xl font-extrabold">
              {APP.PRICE_PER_COURSE} <span className="text-lg text-fg-muted">{APP.CURRENCY}</span>
            </p>
            <p className="mt-1 text-sm text-fg-muted">One-time payment · unlimited access</p>

            <ul className="mt-4 space-y-2 text-sm">
              {[
                'All papers & custom practice',
                'Spaced repetition & analytics',
                'Explanations for every question',
                'Mentor support in each course'
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <Select
              label="Course"
              placeholder={lockedCourses.length === 0 ? 'No courses to purchase' : 'Choose a course'}
              options={options}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={lockedCourses.length === 0}
            />
            <Button
              size="lg"
              fullWidth
              disabled={!subjectId || lockedCourses.length === 0}
              onClick={handleOpen}
            >
              Continue to payment
            </Button>
            <p className="text-center text-xs text-fg-subtle">
              Pay via Telebirr, CBE Birr, or Chapa.
            </p>
            {lockedCourses.length === 0 && (
              <p className="text-center text-xs text-fg-subtle">
                All courses already active. Enjoy practicing!
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="text-center">
        <Button asChild variant="ghost">
          <Link to={ROUTES.STUDENT.COURSES}>Back to courses</Link>
        </Button>
      </div>

      {selected && (
        <PaymentModal
          open={open}
          onClose={() => setOpen(false)}
          subjectId={selected.id}
          subjectName={selected.name}
          amount={APP.PRICE_PER_COURSE}
          onSuccess={() => {
            navigate(ROUTES.STUDENT.COURSE_DETAIL.replace(':subjectId', selected.id));
          }}
        />
      )}
    </div>
  );
}
