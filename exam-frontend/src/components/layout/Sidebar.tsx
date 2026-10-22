import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/IconButton';
import type { NavItem } from './nav-config';

export interface SidebarProps {
  items: NavItem[];
  shared: NavItem[];
  onClose?: () => void;
  mobile?: boolean;
}

export function Sidebar({ items, shared, onClose, mobile }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-border bg-bg-surface/70 backdrop-blur-xl',
        mobile && 'w-72'
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            E
          </span>
          ExamPrep
        </NavLink>
        {mobile && onClose && (
          <IconButton label="Close menu" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavItemLink key={item.to} item={item} onClick={onClose} />
        ))}
        <div className="my-3 h-px bg-border" />
        {shared.map((item) => (
          <NavItemLink key={item.to} item={item} onClick={onClose} />
        ))}
      </nav>
      <div className="border-t border-border p-4 text-xs text-fg-subtle">
        © {new Date().getFullYear()} ExamPrep
      </div>
    </aside>
  );
}

function NavItemLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-brand-500/10 text-brand-200' : 'text-fg-muted hover:bg-white/5 hover:text-fg'
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {typeof item.badge === 'number' && item.badge > 0 && (
        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </NavLink>
  );
}
