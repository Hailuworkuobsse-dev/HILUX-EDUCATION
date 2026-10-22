import { BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, Skeleton } from '@/components/ui';
import { CourseCard, TrialBanner } from '@/features/student/components';
import { useCourses } from '@/features/student/hooks';

export default function CoursesPage() {
  const courses = useCourses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Pick a subject to practice. Each course is included in your trial."
      />
      <TrialBanner />

      {courses.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : courses.data && courses.data.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.data.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No courses available"
            description="Check back soon — teachers are publishing new content."
          />
        </Card>
      )}
    </div>
  );
}
