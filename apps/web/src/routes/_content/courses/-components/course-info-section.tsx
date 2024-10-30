import { t } from 'i18next';

import type { JoinedCourse } from '@blms/types';

import { ListItem } from '#src/components/ListItem/list-item.tsx';

export const CourseInfoSection = ({ course }: { course: JoinedCourse }) => (
  <section className="flex flex-col md:border-t border-white/10 md:mb-8">
    <ListItem
      leftText={t('words.professor')}
      rightText={course.professors
        .map((professor) => professor.name)
        .join(', ')}
      className="lg:py-[3px]"
    />
    <ListItem
      leftText={t('words.level.level')}
      rightText={t(`words.level.${course.level}`)}
      className="lg:py-[3px]"
    />
    <ListItem
      leftText={t('words.duration')}
      rightText={`${course.hours} ${t('words.hours')}`}
      className="lg:py-[3px]"
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
      className="lg:py-[3px]"
    />
    <ListItem
      leftText={t('words.courseId')}
      rightText={course.id.toUpperCase()}
      isDesktopOnly
      className="lg:py-[3px]"
    />
  </section>
);
