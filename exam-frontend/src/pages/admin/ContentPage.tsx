import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, Skeleton, Tabs } from '@/components/ui';
import { ContentFlagCard } from '@/features/admin/components';
import { useContentFlags, useResolveFlag } from '@/features/admin/hooks';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import type { ContentFlagResolution, ContentFlagStatus } from '@/types/admin';

export default function ContentPage() {
  const [status, setStatus] = useState<ContentFlagStatus>('open');
  const flags = useContentFlags(status);
  const resolve = useResolveFlag();
  const toast = useToast();

  const handleResolve = async (id: string, resolution: ContentFlagResolution, reason: string) => {
    try {
      await resolve.mutate({ id, resolution, reason });
      toast.success(`Content ${resolution === 'keep' ? 'kept' : resolution + 'ed'}`);
      flags.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Action failed';
      toast.error('Action failed', msg);
    }
  };

  const content =
    flags.loading ? (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    ) : flags.data && flags.data.length > 0 ? (
      <div className="space-y-3">
        {flags.data.map((f) => (
          <ContentFlagCard
            key={f.id}
            flag={f}
            onResolve={(resolution, reason) => handleResolve(f.id, resolution, reason)}
            resolving={resolve.loading}
          />
        ))}
      </div>
    ) : (
      <Card>
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6" />}
          title="No flags"
          description={`No ${status} content flags right now.`}
        />
      </Card>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content moderation"
        description="Review questions flagged by students and take action."
      />
      <Tabs
        items={[
          { key: 'open', label: 'Open', content },
          { key: 'resolved', label: 'Resolved', content },
          { key: 'dismissed', label: 'Dismissed', content }
        ]}
        value={status}
        onChange={(key) => setStatus(key as ContentFlagStatus)}
      />
    </div>
  );
}
