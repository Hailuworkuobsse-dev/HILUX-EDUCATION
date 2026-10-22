import { Badge } from '@/components/ui';
import type { AuditLogEntry } from '@/types/admin';
import { formatDate } from '@/lib/date';
import { ROLE_LABELS } from '@/lib/roles';

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-fg-muted">
            <th className="py-2 pl-4 pr-2">When</th>
            <th className="px-2">Actor</th>
            <th className="px-2">Action</th>
            <th className="px-2">Resource</th>
            <th className="hidden px-2 md:table-cell">Details</th>
            <th className="hidden px-2 pr-4 sm:table-cell">IP</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
              <td className="py-2 pl-4 pr-2 text-xs text-fg-muted">
                {formatDate(e.createdAt, 'MMM d, HH:mm')}
              </td>
              <td className="px-2 text-xs">
                <p className="font-medium">{e.actorName}</p>
                <p className="text-fg-subtle">{ROLE_LABELS[e.actorRole]}</p>
              </td>
              <td className="px-2">
                <Badge tone="brand" className="text-[10px]">
                  {e.action}
                </Badge>
              </td>
              <td className="px-2 text-xs">
                <span className="text-fg-muted">{e.resourceType}</span>
                {e.resourceId && (
                  <span className="ml-1 font-mono text-[10px] text-fg-subtle">
                    {e.resourceId.slice(0, 8)}
                  </span>
                )}
              </td>
              <td className="hidden max-w-xs truncate px-2 text-xs text-fg-muted md:table-cell">
                {e.meta ? JSON.stringify(e.meta) : '—'}
              </td>
              <td className="hidden px-2 pr-4 font-mono text-[10px] text-fg-subtle sm:table-cell">
                {e.ip ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
