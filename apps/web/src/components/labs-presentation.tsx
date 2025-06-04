import { Link } from '@tanstack/react-router';
import { FaArrowRightLong } from 'react-icons/fa6';

import { ButtonWithArrow, cn } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import { useTranslation } from 'react-i18next';
import LabsImage from '../assets/courses/labs-presentation.webp?no-inline';

interface LabsPresentationProps {
  marginClasses?: string;
}

export const LabsPresentation = ({
  marginClasses = 'mt-20',
}: LabsPresentationProps) => {
  const { t } = useTranslation();

  const isScreenMd = useGreater('md');

  return (
    <section
      className={cn(
        'w-full max-w-7xl flex max-lg:flex-col justify-center items-center gap-10 border border-darkOrange-5 shadow-sm-section rounded-[20px] p-5 md:px-12 md:py-16 mx-auto',
        marginClasses,
      )}
    >
      <img src={LabsImage} alt="B-CERT" className="w-full lg:hidden" />
      <div className="flex flex-col w-1/2 max-lg:w-full">
        <h3 className="max-md:mobile-h3 md:desktop-h4 mb-2.5">
          {t('labs.presentation.title')}
        </h3>
        <span className="max-md:mobile-h3 md:text-2xl font-medium leading-tight tracking-[0.25px] text-darkOrange-5 mb-2.5 lg:mb-10">
          {t('labs.presentation.subtitle')}
        </span>
        <p className="md:desktop-h8 mobile-body1">
          {t('labs.description1')} {t('labs.description2')}
        </p>
        <Link to="/plan-b-labs" className="max-lg:w-full mt-11">
          <ButtonWithArrow
            variant="primary"
            size={isScreenMd ? 'l' : 'm'}
            className="max-lg:w-full"
          >
            {t('labs.presentation.link')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </ButtonWithArrow>
        </Link>
      </div>
      <img src={LabsImage} alt="B-CERT" className="w-1/3 max-lg:hidden" />
    </section>
  );
};
