import type { JoinedCourse } from '@blms/types';
import { ListItem } from '@blms/ui';
import { t } from 'i18next';

export const CourseInfoSection = ({ course }: { course: JoinedCourse }) => (
  <section className="flex flex-col md:mb-8">
    <ListItem
      leftText={t('words.professor')}
      rightText={course.mainProfessors
        .map((professor) => professor.name)
        .join(', ')}
      className="lg:py-1"
      variant="light"
    />
    <ListItem
      leftText={t('words.level.level')}
      rightText={t(`words.level.${course.level}`)}
      className="lg:py-1"
      variant="light"
    />
    <ListItem
      leftText={t('words.duration')}
      rightText={`${course.hours} ${t('words.hours')}`}
      className="lg:py-1"
      variant="light"
    />
    <ListItem
      leftText={t('words.price')}
      rightText={
        course.requiresPayment
          ? course.onlinePriceDollars === null
            ? `${course.inpersonPriceDollars}$`
            : `${course.onlinePriceDollars}$`
          : t('words.free')
      }
      className="lg:py-1"
      variant="light"
    />
  </section>
);
