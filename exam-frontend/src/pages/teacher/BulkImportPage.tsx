import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, Button, Card } from '@/components/ui';
import {
  BulkImportPreview,
  BulkImportUploader
} from '@/features/teacher/components';
import { useCommitImport, useValidateImport } from '@/features/teacher/hooks';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';
import type { BulkImportValidationResult } from '@/types/teacher';

export default function BulkImportPage() {
  const [csv, setCsv] = useState<string>('');
  const [preview, setPreview] = useState<BulkImportValidationResult | null>(null);
  const [imported, setImported] = useState<{ imported: number; skipped: number } | null>(null);
  const validate = useValidateImport();
  const commit = useCommitImport();
  const toast = useToast();

  const handleValidate = async (raw: string) => {
    setCsv(raw);
    setImported(null);
    try {
      const res = await validate.mutate(raw);
      setPreview(res);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Validation failed';
      toast.error('Validation failed', msg);
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await commit.mutate(csv);
      setImported({ imported: res.imported, skipped: res.skipped });
      setPreview(null);
      toast.success(`Imported ${res.imported} questions`);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Import failed';
      toast.error('Import failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.TEACHER.QUESTIONS}
          className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> Question bank
        </Link>
        <PageHeader
          title="Bulk import questions"
          description="Import many questions at once from CSV. Rows are validated server-side before saving."
          actions={
            <Button asChild variant="ghost">
              <Link to={ROUTES.TEACHER.QUESTION_NEW}>Or add one manually</Link>
            </Button>
          }
        />
      </div>

      {imported && (
        <Alert tone="success" title="Import complete">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {imported.imported} questions imported
            {imported.skipped > 0 && `, ${imported.skipped} skipped`}.
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setImported(null)}
            >
              Import more
            </Button>
          </div>
        </Alert>
      )}

      {!preview && !imported && (
        <BulkImportUploader onCsvReady={handleValidate} loading={validate.loading} />
      )}

      {preview && (
        <BulkImportPreview
          result={preview}
          onCancel={() => {
            setPreview(null);
            setCsv('');
          }}
          onConfirm={handleConfirm}
          importing={commit.loading}
        />
      )}

      {!preview && !imported && (
        <Card className="p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Upload className="h-4 w-4" /> How it works
          </p>
          <ol className="list-inside list-decimal space-y-1 text-sm text-fg-muted">
            <li>Download the sample CSV or use your own with the same columns.</li>
            <li>Upload or paste your CSV.</li>
            <li>We validate every row — you see a preview before anything is saved.</li>
            <li>Confirm to import all valid rows as drafts.</li>
          </ol>
        </Card>
      )}
    </div>
  );
}
