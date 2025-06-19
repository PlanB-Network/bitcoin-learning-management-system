import { Loader, cn } from '@blms/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TbCalendar, TbClipboardText, TbClock, TbWeight } from 'react-icons/tb';
import { formatDateRange } from '#src/utils/date.ts';
import { trpc } from '#src/utils/trpc.ts';

export const ExamResults = ({ courseId }: { courseId: string }) => {
  const { i18n } = useTranslation();

  const { data: course } = useQuery(
    trpc.content.getCourse.queryOptions({
      language: i18n.language,
      id: courseId,
    }),
  );

  // Placeholder
  const exams = [
    {
      index: 0,
      name: 'Mid-term exam',
      weight: 25,
      startDate: '15 May 2025',
      endDate: '17 May 2025',
      duration: 14,
      questionsCount: 25,
      averageScore: 85,
      medianScore: 78,
      averageDuration: 420, // in seconds
    },
    {
      index: 1,
      name: 'Project assignment',
      weight: 15,
      startDate: '15 May 2025',
      endDate: '17 May 2025',
      averageScore: 56,
      medianScore: 48,
    },
    {
      index: 2,
      name: 'Final exam',
      weight: 40,
      startDate: '15 May 2025',
      endDate: '17 May 2025',
      duration: 25,
      questionsCount: 50,
      averageScore: 70,
      medianScore: 68,
      averageDuration: 980, // in seconds
    },
  ];

  if (!course) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col w-full max-w-[1066px] p-4 gap-4 border border-newGray-5 bg-white rounded-2xl mt-3 md:mt-8">
      {exams.map((exam) => (
        <ExamCard
          key={exam.index}
          index={exam.index}
          name={exam.name}
          weight={exam.weight}
          startDate={exam.startDate}
          endDate={exam.endDate}
          duration={exam.duration}
          questionsCount={exam.questionsCount}
        />
      ))}
    </div>
  );
};

interface ExamCardProps {
  index: number;
  name: string;
  weight: number;
  startDate: string;
  endDate: string;
  duration?: number;
  questionsCount?: number;
}

const ExamCard = ({
  index,
  name,
  weight,
  startDate,
  endDate,
  duration,
  questionsCount,
}: ExamCardProps) => {
  const { t } = useTranslation();

  return (
    <article className="bg-newGray-6 rounded-2xl overflow-hidden">
      <header className="px-6 py-3 border-b border-newGray-5">
        <h4 className="label-large-med-20px text-newBlack-1">
          {index + 1}. {name}
        </h4>
      </header>

      <section className="p-6">
        <h5 className="mb-3 label-medium-16px text-newBlack-3">
          {t('words.structure')}
        </h5>

        <div className="flex flex-col gap-1.5 bg-white rounded-2xl p-5">
          {questionsCount && (
            <InfoRow
              label={t('words.questions')}
              value={questionsCount}
              icon={<TbClipboardText className="size-6 shrink-0" />}
              showBorder={true}
            />
          )}

          <InfoRow
            label={t('words.weight')}
            value={
              <div className="flex items-center gap-3">
                <span>{weight}%</span>
                <WeightIndicator weight={weight} />
              </div>
            }
            icon={<TbWeight className="size-6 shrink-0" />}
            showBorder={true}
          />

          {duration && (
            <InfoRow
              label={t('words.duration')}
              value={`${duration}'`}
              icon={<TbClock className="size-6 shrink-0" />}
              showBorder={true}
            />
          )}

          <InfoRow
            label={t('words.date')}
            value={formatDateRange(new Date(startDate), new Date(endDate))}
            icon={<TbCalendar className="size-6 shrink-0" />}
          />
        </div>
      </section>
    </article>
  );
};

const InfoRow = ({
  label,
  value,
  icon,
  showBorder = false,
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  showBorder?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'flex justify-between items-center py-1.5 ',
      showBorder && 'border-b border-newGray-6',
      className,
    )}
  >
    <div className="flex items-center gap-2 text-newGray-1">
      {icon}
      <span className={'label-18px'}>{label}</span>
    </div>
    <span className="label-18px text-newBlack-3">{value}</span>
  </div>
);

const WeightIndicator = ({ weight }: { weight: number }) => {
  const filledBars = Math.ceil(weight / 20);
  return (
    <div className="flex gap-0.25">
      {[...Array(5)].map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={`weight-bar-${i}`}
          className={cn(
            'w-1.5 h-5.5',
            i < filledBars ? 'bg-newGray-2' : 'bg-newGray-5',
          )}
        />
      ))}
    </div>
  );
};
