import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { RxReload } from 'react-icons/rx';

import { Button, cn } from '@blms/ui';

interface GlossaryFilterBarProps {
  value?: string;
  isOnWordPage?: boolean;
  onChange: (v: string) => void;
  randomWord?: string;
}

export const GlossaryFilterBar = ({
  value,
  isOnWordPage,
  onChange,
  randomWord,
}: GlossaryFilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center text-xs md:text-xs mb-10 max-md:mt-5',
        isOnWordPage ? '' : 'md:mb-12',
      )}
    >
      <div className="w-full flex flex-col items-center md:gap-2">
        {isOnWordPage ? (
          <>
            <label
              className="mb-6 text-white desktop-h5 w-full"
              htmlFor="glossaryInput"
            >
              {t('glossary.keepLooking')}
            </label>
          </>
        ) : (
          <>
            <p className="text-darkOrange-5 text-sm md:text-xl font-medium leading-[171%] md:leading-tight -tracking-[0.77px] md:tracking-normal text-center">
              {t('glossary.needHelp')}
            </p>
            <label
              className="mb-4 md:mb-10 text-white text-xl md:text-[40px] leading-[171%] md:leading-[116%] -tracking-[0.77px] text-center font-normal"
              htmlFor="glossaryInput"
            >
              {t('glossary.filterBar')}
            </label>
          </>
        )}
      </div>
      <div className="flex justify-center items-center w-full max-md:flex-wrap gap-2 md:gap-7 mx-auto">
        <input
          type="text"
          value={value}
          onClick={() => {
            const element = document.querySelector('#glossaryInput');
            if (element) {
              const elementPosition =
                element.getBoundingClientRect().top + window.scrollY;
              window.scrollTo({
                top: elementPosition - 130,
                behavior: 'smooth',
              });
            }
          }}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          className={cn(
            'w-full max-w-96 md:max-w-[498px] border border-darkOrange-5 focus:ring-1 focus:ring-darkOrange-5 rounded-lg bg-[#1C1F28] py-2 pl-4 text-sm md:text-lg text-white placeholder:text-sm md:placeholder:text-lg placeholder:text-white placeholder:opacity-25 ',
            isOnWordPage
              ? ''
              : 'shadow-search-word-sm md:shadow-search-word-md',
          )}
          placeholder={
            isOnWordPage ? t('glossary.anotherWord') : t('glossary.placeHolder')
          }
          id="glossaryInput"
        />

        <Link
          to={
            randomWord && randomWord.length > 0
              ? '/resources/glossary/$wordId'
              : '/resources/glossary'
          }
          params={{ wordId: randomWord || '' }}
          className="max-md:flex justify-center max-md:w-full max-md:mt-2 shrink-0"
        >
          <Button
            variant="outlineWhite"
            size={window.innerWidth >= 768 ? 'm' : 's'}
            className="shrink-0"
          >
            <span className="mr-3">
              <RxReload />
            </span>
            {t('glossary.randomSearch')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
