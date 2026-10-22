import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.user.findFirst({ where: { email: 'student@examprep.local' } });
  const admin = await prisma.user.findFirst({ where: { email: 'admin@examprep.local' } });
  const math = await prisma.subject.findFirst({ where: { slug: 'mathematics' } });
  const english = await prisma.subject.findFirst({ where: { slug: 'english' } });
  const teacher = await prisma.user.findFirst({ where: { email: 'teacher@examprep.local' } });

  if (!student || !admin || !math || !teacher) {
    console.error('❌ Demo data missing. Run `npm run prisma:seed` first.');
    process.exit(1);
  }

  // 1) A handful of orders across statuses (populate the admin dashboard).
  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    await prisma.order.createMany({
      data: [
        {
          userId: student.id,
          subjectId: math.id,
          amount: 150,
          currency: 'ETB',
          status: 'succeeded',
          provider: 'telebirr',
          providerRef: 'TELE-DEMO-0001',
          paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
        },
        {
          userId: student.id,
          subjectId: english?.id ?? math.id,
          amount: 150,
          currency: 'ETB',
          status: 'pending',
          provider: 'chapa',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
          userId: student.id,
          subjectId: math.id,
          amount: 150,
          currency: 'ETB',
          status: 'failed',
          provider: 'cbe_birr',
          failureReason: 'Insufficient balance'
        }
      ]
    });
    console.log('✓ Created 3 demo orders (succeeded / pending / failed)');
  } else {
    console.log('↻ Orders already exist — skipping');
  }

  // 2) A couple of content flags
  const flagCount = await prisma.contentFlag.count();
  if (flagCount === 0) {
    const q = await prisma.question.findFirst({ where: { createdById: teacher.id } });
    if (q) {
      await prisma.contentFlag.createMany({
        data: [
          {
            questionId: q.id,
            reportedById: student.id,
            reason: 'Wrong answer',
            description:
              'The correct answer shown is not matching the explanation. Please double-check.'
          },
          {
            questionId: q.id,
            reportedById: student.id,
            reason: 'Unclear wording',
            description: 'The question uses a term we were not taught this year.'
          }
        ]
      });
      console.log('✓ Created 2 demo content flags');
    } else {
      console.log('↻ No question authored by the demo teacher — skipping flags');
    }
  } else {
    console.log('↻ Content flags already exist — skipping');
  }

  console.log('');
  console.log('✅ Admin seed complete.');
  console.log('');
  console.log('Admin account: admin@examprep.local / Admin1234');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
