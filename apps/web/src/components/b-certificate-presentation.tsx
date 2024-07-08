import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import { Button, cn } from '@sovereign-university/ui';

import { useGreater } from '#src/hooks/use-greater.js';

import BCertificateImage from '../assets/about/b-certificate-presentation.webp';

interface BCertificatePresentationProps {
  marginClasses?: string;
}

export const BCertificatePresentation = ({
  marginClasses = 'mt-20',
}: BCertificatePresentationProps) => {
  const isScreenMd = useGreater('md');

  return (
    <section
      className={cn(
        'w-full max-w-7xl flex max-lg:flex-col justify-center items-center gap-10 border border-darkOrange-5 shadow-sm-section rounded-[20px] p-5 md:px-12 md:py-16 mx-auto',
        marginClasses,
      )}
    >
      <img
        src={BCertificateImage}
        alt="B-Certificates"
        className="w-1/2 max-lg:w-full"
      />
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
        <Link to="/b-certificate" className="max-lg:mx-auto mt-11">
          <Button
            variant="newPrimary"
            size={isScreenMd ? 'l' : 'm'}
            onHoverArrow
          >
            {t('bCertificate.checkout')}
          </Button>
        </Link>
      </div>
    </section>
  );
};
