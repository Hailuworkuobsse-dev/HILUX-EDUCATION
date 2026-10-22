import { Menu } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { UserMenu } from './UserMenu';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg-base/70 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <IconButton label="Open menu" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </IconButton>
      </div>
      <UserMenu />
    </header>
  );
}
