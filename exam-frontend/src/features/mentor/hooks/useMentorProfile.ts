import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { MentorProfileDetail } from '@/types/mentor';
import { mentorApi, type UpdateMentorProfilePayload } from '../api';

export function useMentorProfile() {
  return useQuery<MentorProfileDetail>(() => mentorApi.getProfile(), []);
}

export function useUpdateMentorProfile() {
  return useMutation<MentorProfileDetail, UpdateMentorProfilePayload>((payload) =>
    mentorApi.updateProfile(payload)
  );
}
