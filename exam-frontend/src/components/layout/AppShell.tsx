import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUnreadThreadCount } from '@/features/mentor/hooks';
import { NAV_BY_ROLE, SHARED_NAV, type NavItem } from './nav-config';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ROUTES } from '@/router/routes';

export function AppShell() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadThreads = useUnreadThreadCount(user?.role === 'mentor');

  const items: NavItem[] = useMemo(() => {
    const base = user ? NAV_BY_ROLE[user.role] : [];
    if (user?.role !== 'mentor' || unreadThreads === 0) return base;
    return base.map((item) =>
      item.to === ROUTES.MENTOR.CHAT ? { ...item, badge: unreadThreads } : item
    );
  }, [user, unreadThreads]);

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar items={items} shared={SHARED_NAV} />
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar
              items={items}
              shared={SHARED_NAV}
              mobile
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
