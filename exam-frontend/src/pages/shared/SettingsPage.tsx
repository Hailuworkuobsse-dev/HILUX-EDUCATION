import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Bell,
  Download,
  Globe,
  KeyRound,
  LogOut,
  Moon,
  Sun,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  PasswordInput,
  Select,
  Skeleton,
  Switch
} from '@/components/ui';
import {
  useChangePassword,
  useDeleteAccount,
  useExportData,
  usePreferences,
  useUpdatePreferences
} from '@/features/account/hooks';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { LANGUAGES } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  am: 'Amharic',
  om: 'Afaan Oromo',
  ti: 'Tigrinya'
};

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Include a number'),
    confirm: z.string()
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match'
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const prefs = usePreferences();
  const updatePrefs = useUpdatePreferences();
  const changePassword = useChangePassword();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

  const [notif, setNotif] = useState({ email: true, sms: true, push: false });
  const [language, setLanguage] = useState('en');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (prefs.data) {
      setNotif(prefs.data.notifications);
      setLanguage(prefs.data.language);
    }
  }, [prefs.data]);

  const savePrefs = async (patch: Parameters<typeof updatePrefs.mutate>[0]) => {
    try {
      await updatePrefs.mutate(patch);
      toast.success('Preferences saved');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Save failed';
      toast.error('Save failed', msg);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onPassword = handleSubmit(async (values) => {
    try {
      await changePassword.mutate({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      toast.success('Password updated');
      reset();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not change password';
      toast.error('Update failed', msg);
    }
  });

  const onExport = async () => {
    try {
      const res = await exportData.mutate();
      window.open(res.url, '_blank', 'noopener');
      toast.success('Export ready', 'Download opened in a new tab.');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Export failed';
      toast.error('Export failed', msg);
    }
  };

  const onDelete = async () => {
    if (confirmText !== 'DELETE') return;
    try {
      await deleteAccount.mutate({ confirm: 'DELETE' });
      toast.success('Account deleted');
      logout();
      navigate(ROUTES.HOME);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Delete failed';
      toast.error('Delete failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, notifications, and preferences."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prefs.loading ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              <Row
                title="Email"
                description={`Send reminders and updates to ${user?.email}`}
                checked={notif.email}
                onChange={(v) => {
                  const next = { ...notif, email: v };
                  setNotif(next);
                  void savePrefs({ notifications: next });
                }}
              />
              <Row
                title="SMS"
                description={`Send trial, streak, and payment alerts to ${user?.phone}`}
                checked={notif.sms}
                onChange={(v) => {
                  const next = { ...notif, sms: v };
                  setNotif(next);
                  void savePrefs({ notifications: next });
                }}
              />
              <Row
                title="Push"
                description="Browser push (requires install / permission)"
                checked={notif.push}
                onChange={(v) => {
                  const next = { ...notif, push: v };
                  setNotif(next);
                  void savePrefs({ notifications: next });
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Language & appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Preferred language"
            options={LANGUAGES.map((l) => ({ value: l, label: LANG_LABELS[l] ?? l }))}
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              void savePrefs({ language: e.target.value });
            }}
          />
          <div>
            <p className="mb-2 text-sm font-medium">Theme</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                leftIcon={<Moon className="h-4 w-4" />}
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button
                type="button"
                variant={theme === 'light' ? 'primary' : 'secondary'}
                leftIcon={<Sun className="h-4 w-4" />}
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPassword} className="space-y-3">
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirm?.message}
              {...register('confirm')}
            />
            <Button type="submit" loading={changePassword.loading || isSubmitting}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Data & privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Export my data</p>
              <p className="text-xs text-fg-muted">
                Download a JSON file with your profile, attempts, and results.
              </p>
            </div>
            <Button
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={onExport}
              loading={exportData.loading}
            >
              Request export
            </Button>
          </div>
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-rose-200">Delete account</p>
                <p className="text-xs text-fg-muted">
                  Permanently removes your profile, progress, and results.
                </p>
              </div>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign out of this device</p>
            <p className="text-xs text-fg-muted">You can sign back in any time.</p>
          </div>
          <Button
            variant="secondary"
            leftIcon={<LogOut className="h-4 w-4" />}
            onClick={() => {
              logout();
              navigate(ROUTES.HOME);
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setConfirmText('');
        }}
        title="Delete account?"
        description="This action is permanent and cannot be undone."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteOpen(false);
                setConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'DELETE'}
              loading={deleteAccount.loading}
              onClick={onDelete}
            >
              Delete account
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Alert tone="danger">
            All your attempts, results, and enrollments will be erased. Payment records are retained
            for legal compliance.
          </Alert>
          <Input
            label={`Type DELETE to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
        </div>
      </Modal>
    </div>
  );
}

function Row({
  title,
  description,
  checked,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-fg-muted">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={title} />
    </div>
  );
}
