import type { BasicCourse } from '@blms/types';
import { CourseTranslationCard } from '#src/routes/$lang/content/translate/-components/course-translation-card.tsx';

interface CourseGridProps {
  courses: BasicCourse[];
  targetLanguage: string;
  className?: string;
  userContributions?: Array<{ courseId: string; assignmentStatus?: string }>;
  refetchUserContributions?: () => Promise<void>;
  onRequestSuccess?: () => void;
}

export const CourseGrid = ({
  courses,
  targetLanguage,
  className = '',
  userContributions,
  refetchUserContributions,
  onRequestSuccess,
}: CourseGridProps) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {courses.map((course) => (
        <CourseTranslationCard
          key={course.id}
          course={course}
          targetLanguage={targetLanguage}
          userContributions={userContributions}
          refetchUserContributions={refetchUserContributions}
          onRequestSuccess={onRequestSuccess}
        />
      ))}
    </div>
  );
};
