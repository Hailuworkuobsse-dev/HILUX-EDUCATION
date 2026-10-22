import { Link } from 'react-router-dom';
import {
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  Settings as SettingsIcon,
  User
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/date';
import { ROLE_LABELS } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const trialActive =
    !!user.trialEndsAt && new Date(user.trialEndsAt).getTime() > Date.now();

  return (
    <div className="space-y-6">
      <PageMeta title="Profile" />
      <PageHeader
        title="Profile"
        description="Your account at a glance."
        actions={
          <Button asChild variant="secondary" leftIcon={<SettingsIcon className="h-4 w-4" />}>
            <Link to={ROUTES.SETTINGS}>Edit in Settings</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar src={user.avatarUrl} name={user.fullName} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{user.fullName}</h2>
              <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
              {(user.emailVerified || user.phoneVerified) && (
                <Badge tone="success">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </Badge>
              )}
              {trialActive && <Badge tone="warning">Trial active</Badge>}
            </div>
            <p className="mt-1 text-xs text-fg-muted">Joined {formatDate(user.createdAt, 'PP')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field icon={Mail} label="Email" value={user.email} />
          <Field icon={Phone} label="Phone" value={user.phone} />
          <Field
            icon={Calendar}
            label="Trial ends"
            value={user.trialEndsAt ? formatDate(user.trialEndsAt, 'PP') : 'No active trial'}
          />
          <Field icon={ShieldCheck} label="Role" value={ROLE_LABELS[user.role]} />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-bg-surface/40 p-4 text-sm text-fg-muted">
        Looking to update your name, email, or password? Head to{' '}
        <Link to={ROUTES.SETTINGS} className="font-medium text-brand-300 hover:underline">
          Settings
        </Link>{' '}
        where you can change your password, notification preferences, language, and more.
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated/40 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-fg-muted">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="truncate text-sm text-fg">{value}</p>
    </div>
  );
}
