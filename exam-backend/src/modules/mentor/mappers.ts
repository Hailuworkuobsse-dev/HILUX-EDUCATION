import type { MentorMessage, MentorReport, MentorThread, User } from '@prisma/client';
import type {
  MenteeDTO,
  MentorMessageDTO,
  MentorProfileDetailDTO,
  MentorReportDTO,
  MentorThreadDTO
} from './types.js';
import { asStringArray, senderRoleFor } from './helpers.js';

// ─── Mentee ───────────────────────────────────────────────────────────────

export interface MenteeRow {
  assignmentId: string;
  menteeId: string;
  assignedAt: Date;
  fullName: string;
  avatarUrl: string | null;
  grade: number | null;
  lastActiveAt: Date | null;
  attemptsCount: bigint | number;
  answered: bigint | number;
  correct: bigint | number;
}

export function toMenteeDTO(
  row: MenteeRow,
  subjects: string[],
  riskOverride?: 'low' | 'medium' | 'high'
): MenteeDTO {
  const answered = Number(row.answered);
  const correct = Number(row.correct);
  const accuracy = answered > 0 ? (correct / answered) * 100 : 0;
  const riskLevel = riskOverride ?? computeRiskLocal(accuracy, answered);

  return {
    id: row.menteeId,
    studentId: row.menteeId,
    studentName: row.fullName,
    avatarUrl: row.avatarUrl,
    grade: row.grade,
    subjects,
    lastActiveAt: (row.lastActiveAt ?? row.assignedAt).toISOString(),
    progressPercent: Math.min(100, Math.round((answered / 200) * 100)),
    accuracy,
    attemptsCount: Number(row.attemptsCount),
    riskLevel,
    assignedAt: row.assignedAt.toISOString()
  };
}

function computeRiskLocal(accuracy: number, answered: number): 'low' | 'medium' | 'high' {
  if (answered === 0) return 'high';
  if (accuracy >= 70) return 'low';
  if (accuracy >= 50) return 'medium';
  return 'high';
}

// ─── Thread ───────────────────────────────────────────────────────────────

type ThreadWithLast = MentorThread & {
  mentee: Pick<User, 'id' | 'fullName' | 'avatarUrl'>;
  messages?: MentorMessage[];
};

export function toThreadDTO(
  thread: ThreadWithLast,
  subjectName: string | null,
  unreadCount: number
): MentorThreadDTO {
  const lastMsg = thread.messages?.[0];
  const preview = lastMsg ? truncate(lastMsg.body) : '';
  const lastSender = lastMsg?.senderId ?? thread.menteeId;

  return {
    id: thread.id,
    menteeId: thread.menteeId,
    menteeName: thread.mentee.fullName,
    menteeAvatarUrl: thread.mentee.avatarUrl,
    subjectId: thread.subjectId,
    subjectName,
    lastMessageAt: thread.lastMessageAt.toISOString(),
    lastMessagePreview: preview,
    lastMessageSenderId: lastSender,
    unreadCount
  };
}

function truncate(body: string, max = 80): string {
  const cleaned = body.replace(/\s+/g, ' ').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

// ─── Message ──────────────────────────────────────────────────────────────

type MessageWithSender = MentorMessage & {
  sender: Pick<User, 'id' | 'fullName' | 'role'>;
};

export function toMessageDTO(m: MessageWithSender): MentorMessageDTO {
  return {
    id: m.id,
    threadId: m.threadId,
    senderId: m.senderId,
    senderName: m.sender.fullName,
    senderRole: senderRoleFor(m.sender.role),
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt?.toISOString() ?? null
  };
}

// ─── Report ───────────────────────────────────────────────────────────────

type ReportWithStudent = MentorReport & {
  student: Pick<User, 'id' | 'fullName'>;
};

export function toReportDTO(r: ReportWithStudent): MentorReportDTO {
  return {
    id: r.id,
    studentId: r.studentId,
    studentName: r.student.fullName,
    subjectId: r.subjectId,
    questionId: r.questionId,
    reason: r.reason,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    resolvedAt: r.resolvedAt?.toISOString() ?? null
  };
}

// ─── Profile ──────────────────────────────────────────────────────────────

type UserWithProfile = User & {
  mentorProfile: {
    subjects: unknown;
    languages: unknown;
    availability: 'available' | 'busy' | 'offline';
    yearsOfExperience: number;
  } | null;
};

export function toProfileDTO(u: UserWithProfile): MentorProfileDetailDTO {
  const profile = u.mentorProfile;
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    subjects: asStringArray(profile?.subjects),
    availability: profile?.availability ?? 'available',
    yearsOfExperience: profile?.yearsOfExperience ?? 0,
    languages: asStringArray(profile?.languages)
  };
}
