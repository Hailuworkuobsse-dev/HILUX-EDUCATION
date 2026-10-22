import { useQuery } from '@/hooks/useQuery';
import type {
  DueReview,
  ProgressPoint,
  StudentOverview,
  TopicAccuracy
} from '@/types/analytics';
import { studentApi } from '../api';

export function useStudentOverview() {
  return useQuery<StudentOverview>(() => studentApi.overview(), []);
}

export function useTopicAccuracy() {
  return useQuery<TopicAccuracy[]>(() => studentApi.topicAccuracy(), []);
}

export function useProgress() {
  return useQuery<ProgressPoint[]>(() => studentApi.progress(), []);
}

export function useDueReviews() {
  return useQuery<DueReview[]>(() => studentApi.dueReviews(), []);
}
