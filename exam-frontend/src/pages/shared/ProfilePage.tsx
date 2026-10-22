import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-fg-muted">
          <p>
            <span className="text-fg">Name:</span> {user?.fullName ?? '—'}
          </p>
          <p>
            <span className="text-fg">Email:</span> {user?.email ?? '—'}
          </p>
          <p>
            <span className="text-fg">Phone:</span> {user?.phone ?? '—'}
          </p>
          <p>
            <span className="text-fg">Role:</span> {user ? ROLE_LABELS[user.role] : '—'}
          </p>
          <p className="pt-2 text-xs text-fg-subtle">
            Profile editing arrives alongside the student dashboard (Step 3).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
