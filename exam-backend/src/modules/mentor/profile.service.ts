import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { toProfileDTO } from './mappers.js';
import { toJsonInput } from './helpers.js';
import type { MentorProfileDetailDTO } from './types.js';

async function loadUserWithProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { mentorProfile: true }
  });
  if (!user) throw ApiError.unauthorized();

  // Defensive: create an empty profile if one is somehow missing
  if (!user.mentorProfile) {
    const profile = await prisma.mentorProfile.create({ data: { userId } });
    return { ...user, mentorProfile: profile };
  }
  return user;
}

export async function getProfile(userId: string): Promise<MentorProfileDetailDTO> {
  const user = await loadUserWithProfile(userId);
  return toProfileDTO(user);
}

export interface UpdateProfileInput {
  bio?: string;
  subjects?: string[];
  yearsOfExperience?: number;
  languages?: string[];
  availability?: 'available' | 'busy' | 'offline';
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<MentorProfileDetailDTO> {
  if (input.bio !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { bio: input.bio }
    });
  }

  await prisma.mentorProfile.update({
    where: { userId },
    data: {
      subjects: toJsonInput(input.subjects),
      languages: toJsonInput(input.languages),
      yearsOfExperience: input.yearsOfExperience,
      availability: input.availability
    }
  });

  return getProfile(userId);
}
