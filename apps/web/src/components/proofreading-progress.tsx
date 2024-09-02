import { t } from 'i18next';
import { FaArrowRightLong } from 'react-icons/fa6';

import { Button, cn } from '@blms/ui';

import largeCircleProgress0 from '#src/assets/proofreading/large_circle_progress_0.webp';
import largeCircleProgress1 from '#src/assets/proofreading/large_circle_progress_1.webp';
import largeCircleProgress2 from '#src/assets/proofreading/large_circle_progress_2.webp';
import largeCircleProgress3 from '#src/assets/proofreading/large_circle_progress_3.webp';
import smallCircleProgress0 from '#src/assets/proofreading/small_circle_progress_0.webp';
import smallCircleProgress1 from '#src/assets/proofreading/small_circle_progress_1.webp';
import smallCircleProgress2 from '#src/assets/proofreading/small_circle_progress_2.webp';
import smallCircleProgress3 from '#src/assets/proofreading/small_circle_progress_3.webp';

const SmallProgressImage = ({ progress }: { progress: number }) => {
  let imgSrc;

  switch (progress) {
    case 1: {
      imgSrc = smallCircleProgress1;
      break;
    }
    case 2: {
      imgSrc = smallCircleProgress2;
      break;
    }
    case 3: {
      imgSrc = smallCircleProgress3;
      break;
    }
    default: {
      imgSrc = smallCircleProgress0;
      break;
    }
  }

  return <img src={imgSrc} alt={`Progress: ${progress}/3`} />;
};

const LargeProgressImage = ({ progress }: { progress: number }) => {
  let imgSrc;

  switch (progress) {
    case 1: {
      imgSrc = largeCircleProgress1;
      break;
    }
    case 2: {
      imgSrc = largeCircleProgress2;
      break;
    }
    case 3: {
      imgSrc = largeCircleProgress3;
      break;
    }
    default: {
      imgSrc = largeCircleProgress0;
      break;
    }
  }

  return (
    <img src={imgSrc} alt={`Progress: ${progress}/3`} className="w-[167px]" />
  );
};

const ContributorsNames = ({
  contributors,
  reward,
  mode,
}: {
  contributors: string[];
  reward: number;
  mode: 'light' | 'dark';
}) => {
  const remainingContributors = 3 - contributors.length;

  const remainingRewards = calculateReward(reward, remainingContributors);

  const Contributor1 =
    contributors.length > 0 ? contributors[0] : remainingRewards[0];

  const Contributor2 =
    contributors.length > 1
      ? contributors[1]
      : remainingRewards[contributors.length === 0 ? 1 : 0];

  const Contributor3 =
    contributors.length > 2
      ? contributors[2]
      : remainingRewards[
          contributors.length === 0 ? 2 : contributors.length === 1 ? 1 : 0
        ];

  const textClasses =
    'truncate max-w-24 w-full text-center text-xs font-medium leading-relaxed tracking-[0.1px]';

  const getColorClass = (index: number) => {
    if (mode === 'dark') {
      if (index === 0)
        return contributors.length > 2
          ? 'text-brightGreen-7'
          : contributors.length > 0
            ? 'text-darkOrange-3'
            : 'text-darkOrange-6';
      if (index === 1)
        return contributors.length > 2
          ? 'text-brightGreen-7'
          : contributors.length > 1
            ? 'text-darkOrange-3'
            : 'text-darkOrange-6';
      if (index === 2)
        return contributors.length > 2
          ? 'text-brightGreen-7'
          : 'text-darkOrange-6';
    } else {
      if (index === 0)
        return contributors.length > 2
          ? 'text-brightGreen-10'
          : contributors.length > 0
            ? 'text-darkOrange-5'
            : 'text-darkOrange-8';
      if (index === 1)
        return contributors.length > 2
          ? 'text-brightGreen-10'
          : contributors.length > 1
            ? 'text-darkOrange-5'
            : 'text-darkOrange-8';
      if (index === 2)
        return contributors.length > 2
          ? 'text-brightGreen-10'
          : 'text-darkOrange-8';
    }
    return '';
  };

  return (
    <>
      <span
        className={cn(
          'absolute top-6 -right-6 rotate-[60deg]',
          textClasses,
          getColorClass(0),
        )}
      >
        {Contributor1}
      </span>
      <span
        className={cn(
          'absolute left-1/2 -translate-x-1/2 bottom-0',
          textClasses,
          getColorClass(1),
        )}
      >
        {Contributor2}
      </span>
      <span
        className={cn(
          'absolute top-6 -left-6 -rotate-[60deg]',
          textClasses,
          getColorClass(2),
        )}
      >
        {Contributor3}
      </span>
    </>
  );
};

interface ProofreadingData {
  contributors: string[];
  reward: number | null;
}

export const ProofreadingProgress = ({
  mode = 'dark',
  proofreadingData,
}: {
  mode: 'light' | 'dark';
  proofreadingData: ProofreadingData;
}) => {
  const contributorsLength = proofreadingData.contributors.length;

  return (
    <div
      className={cn(
        'group p-2.5 hover:p-5 rounded-[20px] shadow-course-navigation justify-start items-start gap-2.5 inline-flex absolute right-6 top-4',
        'max-md:hidden', //proofreadingData.isOriginalLanguage ? 'hidden' : 'max-md:hidden',
        mode === 'dark'
          ? 'bg-newBlack-3'
          : contributorsLength > 2
            ? 'bg-brightGreen-1'
            : 'bg-darkOrange-0',
      )}
    >
      <div className="group-hover:hidden flex items-center gap-1.5">
        <SmallProgressImage progress={contributorsLength} />
        <span
          className={cn(
            'max-lg:hidden body-12px-medium w-[118px] whitespace-pre-line',
            mode === 'dark' ? 'text-white' : 'text-black',
          )}
        >
          {contributorsLength === 3
            ? t('proofreading.completed')
            : t('proofreading.inProgress')}
        </span>
      </div>
      <div className="hidden group-hover:flex max-w-[258px] flex-col gap-4 justify-center">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              'px-2 py-1 rounded-md shadow-course-navigation-sm title-medium-sb-18px',
              mode === 'dark'
                ? 'bg-white/15 text-newGray-4'
                : contributorsLength > 2
                  ? 'bg-brightGreen-2 text-brightGreen-7'
                  : 'bg-[#ff5c00]/15 text-darkOrange-6',
            )}
          >
            {contributorsLength}/3
          </span>
          <span
            className={cn(
              'text-black title-medium-sb-18px',
              mode === 'dark' ? 'text-white' : 'text-black',
            )}
          >
            {t('proofreading.status')}
          </span>
        </div>
        <p
          className={cn(
            'body-12px',
            mode === 'dark' ? 'text-white' : 'text-black',
          )}
        >
          {t('proofreading.description')}
        </p>
        <p
          className={cn(
            'body-12px',
            mode === 'dark' ? 'text-white' : 'text-black',
          )}
        >
          {t('proofreading.thanks')}
        </p>
        <a
          href="https://github.com/PlanB-Network/bitcoin-educational-content"
          target="_blank"
          rel="noreferrer"
          className="flex w-fit"
        >
          <Button
            mode={mode}
            variant={contributorsLength > 2 ? 'secondary' : 'primary'}
            size="xs"
          >
            {t('proofreading.reviewEarn')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        </a>
      </div>
      <div className="hidden group-hover:flex flex-col relative pointer-events-none">
        <LargeProgressImage progress={contributorsLength} />
        <ContributorsNames
          contributors={proofreadingData.contributors}
          reward={proofreadingData.reward ? proofreadingData.reward : 0}
          mode={mode}
        />
      </div>
    </div>
  );
};

const calculateReward = (baseReward: number, remainingContributors: number) => {
  const calculatedRewards = [];
  let reward = baseReward;

  for (let i = 0; i < remainingContributors; i++) {
    calculatedRewards.push(`${Math.ceil(reward).toLocaleString('fr-FR')} sats`);
    reward /= 2;
  }

  return calculatedRewards;
};
