import type { ID, ISODate } from './common';

export type MenteeRiskLevel = 'low' | 'medium' | 'high';
export type MentorAvailability = 'available' | 'busy' | 'offline';
export type MentorReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Mentee {
  id: ID;
  studentId: ID;
  studentName: string;
  avatarUrl: string | null;
  grade: number | null;
  subjects: string[];
  lastActiveAt: ISODate;
  progressPercent: number;
  accuracy: number;
  attemptsCount: number;
  riskLevel: MenteeRiskLevel;
  assignedAt: ISODate;
}

export interface MenteeWeakTopic {
  topicId: ID;
  topicName: string;
  accuracy: number;
}

export interface MenteeRecentAttempt {
  id: ID;
  title: string;
  score: number | null;
  totalQuestions: number;
  submittedAt: ISODate | null;
  status: 'in_progress' | 'graded' | 'submitted' | 'abandoned';
}

export interface MenteeDetail extends Mentee {
  weakTopics: MenteeWeakTopic[];
  recentAttempts: MenteeRecentAttempt[];
  threads: MentorThread[];
}

export interface MentorThread {
  id: ID;
  menteeId: ID;
  menteeName: string;
  menteeAvatarUrl: string | null;
  subjectId: ID | null;
  subjectName: string | null;
  lastMessageAt: ISODate;
  lastMessagePreview: string;
  lastMessageSenderId: ID;
  unreadCount: number;
}

export interface MentorMessage {
  id: ID;
  threadId: ID;
  senderId: ID;
  senderName: string;
  senderRole: 'student' | 'mentor';
  body: string;
  createdAt: ISODate;
  readAt: ISODate | null;
}

export interface MentorReport {
  id: ID;
  studentId: ID;
  studentName: string;
  subjectId: ID | null;
  questionId: ID | null;
  reason: string;
  description: string;
  status: MentorReportStatus;
  createdAt: ISODate;
  resolvedAt: ISODate | null;
}

export interface MentorOverview {
  activeMentees: number;
  unreadThreads: number;
  openReports: number;
  responseRate: number;
  menteesHelpedThisWeek: number;
  recentMentees: Mentee[];
  recentThreads: MentorThread[];
}

export interface MentorProfileDetail {
  id: ID;
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
