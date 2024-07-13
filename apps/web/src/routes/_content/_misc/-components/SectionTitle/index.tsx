import { compose } from '#src/utils/index.js';

interface Props {
  title: string;
  tagLine: string;
  num: number;
  variant?: 'primary' | 'secondary';
  position?: 'right' | 'left';
}

export const SectionTitle = ({
  title,
  tagLine,
  num,
  position = 'left',
  variant = 'primary',
}: Props) => {
  return (
    <div
      className={compose(
        position === 'right'
          ? 'flex-row-reverse pr-4 md:pr-8 lg:pr-14'
          : 'flex-row pl-4 sm:pl-8 lg:pl-14',
        'relative h-24 sm:h-36 lg:h-48 flex items-center',
      )}
    >
      {/* blue circle in bkg */}
      <div
        className={compose(
          variant === 'primary' ? 'bg-blue-600' : 'bg-orange-400',
          position === 'right' ? 'right-0' : 'left-0',
          'w-24 sm:w-36 lg:w-48 h-full rounded-full absolute',
        )}
      />

      <div
        className={compose(
          variant === 'primary' ? 'text-orange-400' : 'text-blue-700',
          'relative z-1 text-3xl sm:text-5xl lg:text-8xl font-bold',
        )}
      >
        {num}
      </div>
      <div
        className={compose(
          position === 'right'
            ? 'mr-4 md:mr-8 items-end'
            : 'ml-4 md:ml-8 items-start',
          'text-white',
          'flex flex-col relative z-2',
        )}
      >
        <h2
          className={compose(
            position === 'right' ? 'text-right' : 'text-left',
            'text-base sm:text-xl lg:text-3xl font-semibold mb-1',
          )}
        >
          {title}
        </h2>
        <p
          className={compose(
            position === 'right' ? 'text-right' : 'text-left',
            'italic text-sm sm:text-base lg:text-lg',
          )}
        >
          {tagLine}
        </p>
      </div>
    </div>
  );
};
