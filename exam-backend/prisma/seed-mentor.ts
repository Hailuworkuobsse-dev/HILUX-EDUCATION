import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findFirst({ where: { email: 'student@examprep.local' } });
  const mentor = await prisma.user.findFirst({ where: { email: 'mentor@examprep.local' } });

  if (!student || !mentor) {
    console.error(
      '❌ Demo users not found. Run `npm run prisma:seed` first (this creates student/mentor demo accounts).'
    );
    process.exit(1);
  }

  // 1) Mentee assignment
  const existingAssignment = await prisma.menteeAssignment.findUnique({
    where: { menteeId_mentorId: { menteeId: student.id, mentorId: mentor.id } }
  });
  if (!existingAssignment) {
    await prisma.menteeAssignment.create({
      data: { menteeId: student.id, mentorId: mentor.id }
    });
    console.log('✓ Created mentee assignment (student → mentor)');
  } else {
    console.log('↻ Mentee assignment already exists');
  }

  // 2) Thread + messages
  let thread = await prisma.mentorThread.findFirst({
    where: { menteeId: student.id, mentorId: mentor.id, subjectId: null }
  });

  if (!thread) {
    thread = await prisma.mentorThread.create({
      data: { menteeId: student.id, mentorId: mentor.id, subjectId: null }
    });
    console.log('✓ Created mentor thread');

    await prisma.mentorMessage.createMany({
      data: [
        {
          threadId: thread.id,
          senderId: student.id,
          body: 'Hi! I need help with algebra. Quadratics are killing me.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26)
        },
        {
          threadId: thread.id,
          senderId: mentor.id,
          body: "Hey! Happy to help. Let's start with factoring — can you solve x² - 5x + 6 = 0?",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
        },
        {
          threadId: thread.id,
          senderId: student.id,
          body: 'Is it (x - 2)(x - 3) = 0? So x = 2 or 3?',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
        }
      ]
    });
    const lastMsg = await prisma.mentorMessage.findFirst({
      where: { threadId: thread.id },
      orderBy: { createdAt: 'desc' }
    });
    if (lastMsg) {
      await prisma.mentorThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: lastMsg.createdAt }
      });
    }
    console.log('✓ Created 3 sample messages (1 unread for the mentor)');
  } else {
    console.log('↻ Thread already exists');
  }

  // 3) Reports — one assigned, one in the shared pool
  const openReports = await prisma.mentorReport.count({
    where: { OR: [{ mentorId: mentor.id }, { mentorId: null }], status: 'open' }
  });
  if (openReports === 0) {
    const question = await prisma.question.findFirst();
    if (!question) {
      console.warn('⚠️  No questions found — skipping report creation');
    } else {
      await prisma.mentorReport.createMany({
        data: [
          {
            studentId: student.id,
            mentorId: mentor.id,
            subjectId: question.subjectId,
            questionId: question.id,
            reason: 'Wrong answer',
            description:
              'The question says "x + 2 = 5" but the marked correct answer was 4. It should be 3.'
          },
          {
            studentId: student.id,
            mentorId: null,
            subjectId: question.subjectId,
            questionId: question.id,
            reason: 'Unclear wording',
            description:
              'Option C and D look identical. Please clarify which one is correct.'
          }
        ]
      });
      console.log('✓ Created 2 sample reports (1 assigned, 1 in shared pool)');
    }
  } else {
    console.log('↻ Reports already exist');
  }

  // 4) Two graded attempts so the mentee shows meaningful stats
  const attemptCount = await prisma.attempt.count({
    where: { userId: student.id, status: 'graded' }
  });
  if (attemptCount === 0) {
    const paper = await prisma.examPaper.findFirst({
      where: { status: 'published' },
      include: {
        questions: { include: { question: { include: { options: true } } } }
      }
    });
    if (paper && paper.questions.length > 0) {
      for (const targetScore of [80, 45]) {
        const correctCount = Math.max(
          0,
          Math.round((targetScore / 100) * paper.questions.length)
        );

        const answers = paper.questions.map((pq, i) => {
          const isCorrect = i < correctCount;
          const correctOpt = pq.question.options.find(
            (o) => o.id === pq.question.correctOptionId
          );
          const wrongOpt = pq.question.options.find(
            (o) => o.id !== pq.question.correctOptionId
          );
          return {
            questionId: pq.questionId,
            selectedOptionId: isCorrect
              ? (correctOpt?.id ?? null)
              : (wrongOpt?.id ?? null),
            isCorrect,
            timeSpentMs: 15000,
            orderIndex: i
          };
        });

        await prisma.attempt.create({
          data: {
            userId: student.id,
            paperId: paper.id,
            subjectId: paper.subjectId,
            mode: 'paper',
            status: 'graded',
            title: paper.title,
            durationMinutes: paper.durationMinutes,
            totalQuestions: paper.questions.length,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 23),
            score: targetScore,
            correctCount,
            answers: { create: answers }
          }
        });
      }
      console.log('✓ Created 2 graded attempts (80% and 45%)');
    }
  } else {
    console.log(`↻ Student already has ${attemptCount} graded attempts — skipping`);
  }

  console.log('');
  console.log('✅ Mentor seed complete.');
  console.log('');
  console.log('Demo mentor:  mentor@examprep.local / Mentor1234');
  console.log('Demo mentee:  student@examprep.local / Student1234');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
