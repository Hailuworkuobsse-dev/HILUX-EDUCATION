import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SUBJECTS: { slug: string; name: string; iconKey: string }[] = [
  { slug: 'mathematics', name: 'Mathematics', iconKey: 'calculator' },
  { slug: 'english', name: 'English', iconKey: 'book' },
  { slug: 'physics', name: 'Physics', iconKey: 'atom' },
  { slug: 'chemistry', name: 'Chemistry', iconKey: 'flask' },
  { slug: 'biology', name: 'Biology', iconKey: 'leaf' },
  { slug: 'geography', name: 'Geography', iconKey: 'globe' },
  { slug: 'history', name: 'History', iconKey: 'landmark' },
  { slug: 'civics', name: 'Civics', iconKey: 'scale' },
  { slug: 'amharic', name: 'Amharic', iconKey: 'languages' },
  { slug: 'afaan-oromo', name: 'Afaan Oromo', iconKey: 'languages' },
  { slug: 'tigrinya', name: 'Tigrinya', iconKey: 'languages' },
  { slug: 'it', name: 'Information Technology', iconKey: 'cpu' }
];

const TOPICS: Record<string, string[]> = {
  mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics', 'Functions'],
  english: ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing'],
  physics: ['Mechanics', 'Waves', 'Electricity', 'Thermodynamics'],
  chemistry: ['Atomic Structure', 'Chemical Reactions', 'Organic Chemistry', 'Stoichiometry'],
  biology: ['Cell Biology', 'Genetics', 'Ecology', 'Human Anatomy'],
  geography: ['Physical Geography', 'Human Geography', 'Climate', 'Map Reading'],
  history: ['Ancient History', 'Modern History', 'World Wars', 'Ethiopian History'],
  civics: ['Constitution', 'Democracy', 'Human Rights', 'Civic Duties'],
  amharic: ['Grammar', 'Vocabulary', 'Reading'],
  'afaan-oromo': ['Grammar', 'Vocabulary', 'Reading'],
  tigrinya: ['Grammar', 'Vocabulary', 'Reading'],
  it: ['Computer Basics', 'Software', 'Networking', 'Internet']
};

async function main() {
  console.log('▶ Seeding subjects and topics…');

  const subjectMap: Record<string, string> = {};

  for (const [i, s] of SUBJECTS.entries()) {
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, iconKey: s.iconKey, sortOrder: i },
      create: { slug: s.slug, name: s.name, iconKey: s.iconKey, sortOrder: i }
    });
    subjectMap[s.slug] = subject.id;

    for (const topicName of TOPICS[s.slug] ?? []) {
      const exists = await prisma.topic.findFirst({
        where: { subjectId: subject.id, name: topicName }
      });
      if (!exists) {
        await prisma.topic.create({ data: { subjectId: subject.id, name: topicName } });
      }
    }
  }
  console.log(`   ✓ ${SUBJECTS.length} subjects with topics`);

  // ─── Admin user ─────────────────────────────────────────────────────────
  console.log('▶ Seeding admin user…');
  const adminEmail = 'admin@examprep.local';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      phone: '+251900000000',
      passwordHash: await bcrypt.hash('Admin1234', 12),
      fullName: 'Platform Admin',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      notificationPreference: {
        create: { email: true, sms: true, push: false, language: 'en' }
      }
    }
  });
  console.log(`   ✓ Admin: ${adminEmail} / Admin1234`);

  // ─── Teacher user ────────────────────────────────────────────────────────
  console.log('▶ Seeding teacher user…');
  const teacherEmail = 'teacher@examprep.local';
  const teacher = await prisma.user.upsert({
    where: { email: teacherEmail },
    update: {},
    create: {
      email: teacherEmail,
      phone: '+251900000001',
      passwordHash: await bcrypt.hash('Teacher1234', 12),
      fullName: 'Sample Teacher',
      role: 'teacher',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      notificationPreference: {
        create: { email: true, sms: false, push: false, language: 'en' }
      }
    }
  });
  console.log(`   ✓ Teacher: ${teacherEmail} / Teacher1234`);

  // ─── Mentor user ─────────────────────────────────────────────────────────
  console.log('▶ Seeding mentor user…');
  const mentorEmail = 'mentor@examprep.local';
  const mentor = await prisma.user.upsert({
    where: { email: mentorEmail },
    update: {},
    create: {
      email: mentorEmail,
      phone: '+251900000002',
      passwordHash: await bcrypt.hash('Mentor1234', 12),
      fullName: 'Sample Mentor',
      role: 'mentor',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      notificationPreference: {
        create: { email: true, sms: true, push: false, language: 'en' }
      },
      mentorProfile: {
        create: {
          subjects: ['Mathematics', 'Physics', 'Chemistry'],
          languages: ['en', 'am'],
          yearsOfExperience: 2,
          availability: 'available',
          verified: true
        }
      }
    }
  });
  console.log(`   ✓ Mentor: ${mentorEmail} / Mentor1234`);

  // ─── Student user ────────────────────────────────────────────────────────
  console.log('▶ Seeding student user…');
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const studentEmail = 'student@examprep.local';
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      phone: '+251900000003',
      passwordHash: await bcrypt.hash('Student1234', 12),
      fullName: 'Sample Student',
      role: 'student',
      status: 'active',
      grade: 10,
      emailVerified: true,
      phoneVerified: true,
      trialStartedAt: now,
      trialEndsAt,
      notificationPreference: {
        create: { email: true, sms: true, push: false, language: 'en' }
      }
    }
  });
  console.log(`   ✓ Student: ${studentEmail} / Student1234`);

  // ─── Sample question + paper (Math) ──────────────────────────────────────
  console.log('▶ Seeding sample questions and paper…');
  const mathSubject = subjectMap['mathematics'];
  if (mathSubject) {
    const algebra = await prisma.topic.findFirst({
      where: { subjectId: mathSubject, name: 'Algebra' }
    });
    const geometry = await prisma.topic.findFirst({
      where: { subjectId: mathSubject, name: 'Geometry' }
    });

    if (algebra && geometry) {
      const existing = await prisma.question.findFirst({
        where: { subjectId: mathSubject, createdById: teacher.id }
      });

      if (!existing) {
        const q1 = await prisma.question.create({
          data: {
            subjectId: mathSubject,
            topicId: algebra.id,
            difficulty: 'easy',
            year: 2023,
            language: 'en',
            prompt: 'If x + 2 = 5, what is the value of x?',
            explanation: 'Subtract 2 from both sides: x = 5 − 2 = 3.',
            correctOptionId: 'opt-3',
            status: 'published',
            publishedAt: new Date(),
            createdById: teacher.id,
            reviewedById: admin.id,
            options: {
              create: [
                { id: 'opt-1', label: 'A', text: '1', orderIndex: 0 },
                { id: 'opt-2', label: 'B', text: '2', orderIndex: 1 },
                { id: 'opt-3', label: 'C', text: '3', orderIndex: 2 },
                { id: 'opt-4', label: 'D', text: '4', orderIndex: 3 }
              ]
            }
          }
        });

        const q2 = await prisma.question.create({
          data: {
            subjectId: mathSubject,
            topicId: geometry.id,
            difficulty: 'medium',
            year: 2023,
            language: 'en',
            prompt: 'The area of a circle with radius 3 is…',
            explanation: 'Area = πr² = π × 3² = 9π.',
            correctOptionId: 'q2-c',
            status: 'published',
            publishedAt: new Date(),
            createdById: teacher.id,
            reviewedById: admin.id,
            options: {
              create: [
                { id: 'q2-a', label: 'A', text: '3π', orderIndex: 0 },
                { id: 'q2-b', label: 'B', text: '6π', orderIndex: 1 },
                { id: 'q2-c', label: 'C', text: '9π', orderIndex: 2 },
                { id: 'q2-d', label: 'D', text: '12π', orderIndex: 3 }
              ]
            }
          }
        });

        await prisma.examPaper.create({
          data: {
            subjectId: mathSubject,
            title: 'Grade 10 Mathematics — 2023 Practice',
            year: 2023,
            durationMinutes: 60,
            difficulty: 'medium',
            status: 'published',
            language: 'en',
            publishedAt: new Date(),
            createdById: teacher.id,
            reviewedById: admin.id,
            questions: {
              create: [
                { questionId: q1.id, orderIndex: 0 },
                { questionId: q2.id, orderIndex: 1 }
              ]
            }
          }
        });

        console.log('   ✓ 2 sample questions + 1 sample paper');
      } else {
        console.log('   ↻ Sample questions already present — skipping');
      }
    }
  }

  // ─── Enroll sample student in Mathematics (trialing) ─────────────────────
  if (mathSubject) {
    await prisma.enrollment.upsert({
      where: { userId_subjectId: { userId: student.id, subjectId: mathSubject } },
      update: {},
      create: {
        userId: student.id,
        subjectId: mathSubject,
        status: 'trialing',
        trialEndsAt
      }
    });
    console.log('   ✓ Student enrolled in Mathematics (trialing)');
  }

  console.log('');
  console.log('✅ Seed complete.');
  console.log('');
  console.log('Demo accounts:');
  console.log('  admin@examprep.local   / Admin1234    (role: admin)');
  console.log('  teacher@examprep.local / Teacher1234  (role: teacher)');
  console.log('  mentor@examprep.local  / Mentor1234   (role: mentor)');
  console.log('  student@examprep.local / Student1234  (role: student, 90-day trial)');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
