import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { MentorReport, MentorReportStatus } from '@/types/mentor';
import { mentorApi } from '../api';

export function useReports(status?: MentorReportStatus) {
  return useQuery<MentorReport[]>(() => mentorApi.listReports(status), [status]);
}

export function useUpdateReportStatus() {
  return useMutation<
    MentorReport,
    { id: string; status: MentorReportStatus }
  >(({ id, status }) => mentorApi.updateReportStatus(id, status));
}
