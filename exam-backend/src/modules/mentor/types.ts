export type MenteeRisk = 'low' | 'medium' | 'high';
export type MentorAvailability = 'available' | 'busy' | 'offline';
export type MentorReportStatus = 'open' | 'resolved' | 'dismissed';

export interface MenteeDTO {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl: string | null;
  grade: number | null;
  subjects: string[];
  lastActiveAt: string;
  progressPercent: number;
  accuracy: number;
  attemptsCount: number;
  riskLevel: MenteeRisk;
  assignedAt: string;
}

export interface MenteeWeakTopicDTO {
  topicId: string;
  topicName: string;
  accuracy: number;
}

export interface MenteeRecentAttemptDTO {
  id: string;
  title: string;
  score: number | null;
  totalQuestions: number;
  submittedAt: string | null;
  status: 'in_progress' | 'graded' | 'submitted' | 'abandoned';
}

export interface MenteeDetailDTO extends MenteeDTO {
  weakTopics: MenteeWeakTopicDTO[];
  recentAttempts: MenteeRecentAttemptDTO[];
  threads: MentorThreadDTO[];
}

export interface MentorThreadDTO {
  id: string;
  menteeId: string;
  menteeName: string;
  menteeAvatarUrl: string | null;
  subjectId: string | null;
  subjectName: string | null;
  lastMessageAt: string;
  lastMessagePreview: string;
  lastMessageSenderId: string;
  unreadCount: number;
}

export interface MentorMessageDTO {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'mentor';
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface MentorReportDTO {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string | null;
  questionId: string | null;
  reason: string;
  description: string;
  status: MentorReportStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface MentorOverviewDTO {
  activeMentees: number;
  unreadThreads: number;
  openReports: number;
  responseRate: number;
  menteesHelpedThisWeek: number;
  recentMentees: MenteeDTO[];
  recentThreads: MentorThreadDTO[];
}

export interface MentorProfileDetailDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string | null;
  avatarUrl: string | null;
  subjects: string[];
  availability: MentorAvailability;
  yearsOfExperience: number;
  languages: string[];
}
