import { useMutation } from '@/hooks/useMutation';
import type { BulkImportResult, BulkImportValidationResult } from '@/types/teacher';
import { teacherApi } from '../api';

export function useValidateImport() {
  return useMutation<BulkImportValidationResult, string>((csv) =>
    teacherApi.validateImport(csv)
  );
}

export function useCommitImport() {
  return useMutation<BulkImportResult, string>((csv) => teacherApi.commitImport(csv));
}
