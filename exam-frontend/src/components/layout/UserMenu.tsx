import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/features/auth/hooks';
import { useClickOutside } from '@/hooks/useClickOutside';
import { ROLE_LABELS } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

export function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout.mutate();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-white/5 focus-ring"
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
        <div className="hidden text-left sm:block">
          <p className="text-xs font-semibold leading-tight text-fg">{user.fullName}</p>
          <p className="text-[10px] leading-tight text-fg-muted">{ROLE_LABELS[user.role]}</p>
        </div>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-border bg-bg-surface shadow-xl animate-fade-in"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.fullName}</p>
            <p className="truncate text-xs text-fg-muted">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              to={ROUTES.PROFILE}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              to={ROUTES.SETTINGS}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.loading}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" /> {logout.loading ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
