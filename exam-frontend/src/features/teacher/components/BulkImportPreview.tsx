import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { BulkImportValidationResult } from '@/types/teacher';

export interface BulkImportPreviewProps {
  result: BulkImportValidationResult;
  onConfirm: () => void;
  onCancel: () => void;
  importing?: boolean;
}

export function BulkImportPreview({
  result,
  onConfirm,
  onCancel,
  importing
}: BulkImportPreviewProps) {
  const { summary, rows } = result;
  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <Badge tone="success">{summary.valid} valid</Badge>
          <Badge tone="danger">{summary.invalid} invalid</Badge>
          <Badge tone="default">{summary.total} rows</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={summary.valid === 0} loading={importing}>
            Import {summary.valid} valid
          </Button>
        </div>
      </Card>

      <Card className="divide-y divide-border p-0">
        <div className="grid grid-cols-[60px_80px_1fr] gap-2 bg-bg-elevated/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
          <span>Row</span>
          <span>Status</span>
          <span>Details</span>
        </div>
        {rows.map((r) => (
          <div key={r.rowNumber} className="grid grid-cols-[60px_80px_1fr] items-start gap-2 px-3 py-2 text-sm">
            <span className="text-fg-muted">#{r.rowNumber}</span>
            <span>
              {r.status === 'valid' ? (
                <Badge tone="success">
                  <CheckCircle2 className="h-3 w-3" /> OK
                </Badge>
              ) : (
                <Badge tone="danger">
                  <AlertCircle className="h-3 w-3" /> Invalid
                </Badge>
              )}
            </span>
            <span className="text-fg-muted">
              {r.status === 'valid' ? (
                <>
                  <span className="text-fg">{r.subjectName}</span> — {r.prompt}
                </>
              ) : (
                <ul className="list-inside list-disc space-y-0.5 text-xs text-rose-300">
                  {r.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
