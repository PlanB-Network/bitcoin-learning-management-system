import { CourseLevel } from '@blms/constants';
import { cn } from '@blms/ui';
import { useTranslation } from 'react-i18next';

export const CourseLevelTag = ({
  level,
  addPadding,
}: {
  level: CourseLevel;
  addPadding?: boolean;
}) => {
  const { t } = useTranslation();

  const levelLabels = {
    [CourseLevel.Beginner]: t('words.level.beginner'),
    [CourseLevel.Intermediate]: t('words.level.intermediate'),
    [CourseLevel.Advanced]: t('words.level.advanced'),
    [CourseLevel.Expert]: t('words.level.expert'),
  };

  const levelToFilled = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const filled = levelToFilled[level];
  const label = levelLabels[level];

  return (
    <div className={cn('flex items-center gap-2', addPadding && 'p-2')}>
      <div className="w-2.5 flex flex-col justify-center items-center gap-px">
        {[4, 3, 2, 1].map((i) => (
          <div
            key={i}
            className={`self-stretch h-[3px] rounded-[1px] ${
              i <= filled ? 'bg-blue-200' : 'bg-blue-200/30'
            }`}
          />
        ))}
      </div>
      <div className="text-blue-900 body-extra-small-bold">{label}</div>
    </div>
  );
};
