import { Link } from 'react-router-dom';
import { Avatar, Badge } from '@/components/ui';
import type { AdminUser } from '@/types/admin';
import { formatRelative } from '@/lib/date';
import { ROLE_LABELS } from '@/lib/roles';
import { formatBirr } from '@/lib/currency';
import { ROUTES } from '@/router/routes';
import { UserStatusBadge } from './UserStatusBadge';

export function UserTableRow({ user }: { user: AdminUser }) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-white/[0.02]">
      <td className="py-3 pl-4 pr-2">
        <Link
          to={ROUTES.ADMIN.USER_DETAIL.replace(':userId', user.id)}
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar src={user.avatarUrl} name={user.fullName} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs text-fg-muted">{user.email}</p>
          </div>
        </Link>
      </td>
      <td className="hidden px-2 py-3 sm:table-cell">
        <Badge tone="default">{ROLE_LABELS[user.role]}</Badge>
      </td>
      <td className="px-2 py-3">
        <UserStatusBadge status={user.status} />
      </td>
      <td className="hidden px-2 py-3 text-right text-xs md:table-cell">
        {user.enrollments}
      </td>
      <td className="hidden px-2 py-3 text-right text-xs md:table-cell">
        {formatBirr(user.totalSpent)}
      </td>
      <td className="hidden px-2 py-3 text-right text-xs sm:table-cell">
        {user.lastActiveAt ? formatRelative(user.lastActiveAt) : 'Never'}
      </td>
    </tr>
  );
}
