import { Link } from '@tanstack/react-router';
import { FaArrowRightLong } from 'react-icons/fa6';

import { Button, cn } from '@blms/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import { useTranslation } from 'react-i18next';
import BCertImage from '../assets/about/bcert-presentation.webp';

interface BCertPresentationProps {
  marginClasses?: string;
}

export const BCertPresentation = ({
  marginClasses = 'mt-20',
}: BCertPresentationProps) => {
  const { t } = useTranslation();

  const isScreenMd = useGreater('md');

  return (
    <section
      className={cn(
        'w-full max-w-7xl flex max-lg:flex-col justify-center items-center gap-10 border border-darkOrange-5 shadow-sm-section rounded-[20px] p-5 md:px-12 md:py-16 mx-auto',
        marginClasses,
      )}
    >
      <img src={BCertImage} alt="B-CERT" className="w-1/2 max-lg:w-full" />
      <div className="flex flex-col w-1/2 max-lg:w-full">
        <h3 className="max-md:mobile-h3 md:desktop-h4 mb-2.5">
          {t('bCertificate.knowledgeableBitcoin')}
        </h3>
        <span className="max-md:mobile-h3 md:text-2xl font-medium leading-tight tracking-[0.25px] text-darkOrange-5 mb-2.5 lg:mb-10">
          {t('bCertificate.challengeYourself')}
        </span>
        <p className="md:desktop-h8 mobile-body1">
          {t('bCertificate.bCertificateDescription')}
        </p>
        <Link to="/b-cert" className="max-lg:mx-auto mt-11">
          <Button variant="primary" size={isScreenMd ? 'l' : 'm'}>
            {t('bCertificate.checkout')}
            <FaArrowRightLong
              className={cn(
                'opacity-0 max-w-0 inline-flex whitespace-nowrap transition-[max-width_opacity] overflow-hidden ease-in-out duration-150 group-hover:max-w-96 group-hover:opacity-100',
                'group-hover:ml-3',
              )}
            />
          </Button>
        </Link>
      </div>
    </section>
  );
};
