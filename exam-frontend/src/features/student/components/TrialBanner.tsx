import { Link } from 'react-router-dom';
import { Clock, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import { APP } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

export function TrialBanner() {
  const { user } = useAuth();
  if (!user?.trialEndsAt) return null;

  const endsAt = new Date(user.trialEndsAt).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((endsAt - now) / (1000 * 60 * 60 * 24)));
  const expired = daysLeft <= 0;

  return (
    <div
      className={`flex flex-col items-start justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
        expired
          ? 'border-danger/30 bg-danger/5'
          : daysLeft <= 7
            ? 'border-warning/30 bg-warning/5'
            : 'border-brand-500/30 bg-brand-500/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            expired ? 'bg-danger/10 text-danger' : 'bg-brand-500/10 text-brand-300'
          }`}
        >
          {expired ? <Clock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
        </span>
        <div>
          <p className="text-sm font-semibold">
            {expired
              ? 'Your free trial has ended'
              : daysLeft === 1
                ? 'Last day of your free trial'
                : `${daysLeft} days left in your free trial`}
          </p>
          <p className="text-xs text-fg-muted">
            {expired
              ? `Continue any course for ${APP.PRICE_PER_COURSE} ${APP.CURRENCY}.`
              : `Subscribe after ${APP.TRIAL_DAYS} days for ${APP.PRICE_PER_COURSE} ${APP.CURRENCY} per course.`}
          </p>
        </div>
      </div>
      {expired && (
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.STUDENT.SUBSCRIBE}>Subscribe now</Link>
        </Button>
      )}
    </div>
  );
}
