import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

async function main() {
  // 1) Ensure a second teacher exists so the review workflow can be tested
  const teacher2Email = 'teacher2@examprep.local';
  const teacher2 = await prisma.user.upsert({
    where: { email: teacher2Email },
    update: {},
    create: {
      email: teacher2Email,
      phone: '+251900000010',
      passwordHash: await bcrypt.hash('Teacher1234', 12),
      fullName: 'Second Teacher',
      role: 'teacher',
      status: 'active',
      emailVerified: true,
      phoneVerified: true,
      notificationPreference: {
        create: { email: true, sms: false, push: false, language: 'en' }
      }
    }
  });

  const teacher1 = await prisma.user.findFirst({
    where: { email: 'teacher@examprep.local' }
  });
  if (!teacher1) {
    console.error('❌ Demo teacher not found. Run `npm run prisma:seed` first.');
    process.exit(1);
  }

  // 2) Ensure a math subject/topic exists
  const math = await prisma.subject.findFirst({ where: { slug: 'mathematics' } });
  if (!math) {
    console.error('❌ Mathematics subject not found. Run `npm run prisma:seed` first.');
    process.exit(1);
  }
  const algebra = await prisma.topic.findFirst({
    where: { subjectId: math.id, name: 'Algebra' }
  });
  const geometry = await prisma.topic.findFirst({
    where: { subjectId: math.id, name: 'Geometry' }
  });
  if (!algebra || !geometry) {
    console.error('❌ Algebra/Geometry topics not found.');
    process.exit(1);
  }
  // Captured as a plain string so the helpers below don't have to re-narrow.
  const mathSubjectId = math.id;

  // 3) Sample questions helper
  async function makeQuestion(
    authorId: string,
    status: 'draft' | 'review' | 'published',
    topicId: string,
    prompt: string,
    options: string[],
    correct: number
  ) {
    const existing = await prisma.question.findFirst({
      where: { prompt, createdById: authorId }
    });
    if (existing) return existing;

    const ids = options.map(() => randomUUID());
    const correctOptionId = ids[correct];

    return prisma.question.create({
      data: {
        subjectId: mathSubjectId,
        topicId,
        difficulty: 'medium',
        year: 2024,
        language: 'en',
        prompt,
        explanation: 'Straightforward algebra.',
        correctOptionId,
        status,
        createdById: authorId,
        ...(status === 'published'
          ? { reviewedById: teacher2.id, publishedAt: new Date() }
          : {}),
        options: {
          create: options.map((text, i) => ({
            id: ids[i],
            label: LABELS[i],
            text,
            orderIndex: i
          }))
        }
      }
    });
  }

  // 4) teacher1's questions: 2 drafts, 1 in review, 3 published
  await makeQuestion(
    teacher1.id,
    'draft',
    algebra.id,
    'Solve for x: 3x + 4 = 19',
    ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
    1
  );
  await makeQuestion(
    teacher1.id,
    'draft',
    geometry.id,
    'What is the perimeter of a square with side 6?',
    ['12', '18', '24', '36'],
    2
  );
  await makeQuestion(
    teacher1.id,
    'review',
    algebra.id,
    'Simplify: 2(x + 3) - 4',
    ['2x + 2', '2x + 6', '2x - 1', 'x + 2'],
    0
  );
  const p1 = await makeQuestion(
    teacher1.id,
    'published',
    algebra.id,
    'What is the slope of the line through (0, 0) and (2, 4)?',
    ['1', '2', '3', '4'],
    1
  );
  const p2 = await makeQuestion(
    teacher1.id,
    'published',
    algebra.id,
    'Factor: x² - 9',
    ['(x - 3)(x + 3)', '(x - 9)(x + 1)', '(x - 3)²', '(x + 3)²'],
    0
  );
  await makeQuestion(
    teacher1.id,
    'published',
    geometry.id,
    'Area of a triangle with base 8 and height 5?',
    ['13', '20', '40', '80'],
    1
  );

  // 5) teacher2's questions in review (visible to teacher1)
  await makeQuestion(
    teacher2.id,
    'review',
    algebra.id,
    'Solve: 5 - 2x = 11',
    ['x = -3', 'x = 3', 'x = 8', 'x = -8'],
    0
  );
  await makeQuestion(
    teacher2.id,
    'review',
    geometry.id,
    'What is the volume of a cube with side 3?',
    ['9', '18', '27', '81'],
    2
  );

  // 6) Papers for teacher1 (draft / published) and teacher2 (review)
  async function makePaper(
    authorId: string,
    status: 'draft' | 'review' | 'published',
    title: string,
    questionIds: string[]
  ) {
    const existing = await prisma.examPaper.findFirst({
      where: { title, createdById: authorId }
    });
    if (existing) return existing;

    return prisma.examPaper.create({
      data: {
        subjectId: mathSubjectId,
        title,
        year: 2024,
        durationMinutes: 30,
        difficulty: 'medium',
        status,
        language: 'en',
        createdById: authorId,
        ...(status === 'published'
          ? { reviewedById: teacher2.id, publishedAt: new Date() }
          : {}),
        questions: {
          create: questionIds.map((qid, i) => ({
            questionId: qid,
            orderIndex: i
          }))
        }
      }
    });
  }

  await makePaper(teacher1.id, 'draft', 'Algebra — Draft Paper', [p1.id, p2.id]);
  await makePaper(teacher1.id, 'published', 'Algebra — Published Paper', [p1.id, p2.id]);
  await makePaper(teacher2.id, 'review', 'Geometry — Submitted by Teacher 2', []);

  console.log('');
  console.log('✅ Teacher seed complete.');
  console.log('');
  console.log('Accounts:');
  console.log('  teacher@examprep.local   / Teacher1234  (teacher 1 — demo)');
  console.log('  teacher2@examprep.local  / Teacher1234  (teacher 2 — for review tests)');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
