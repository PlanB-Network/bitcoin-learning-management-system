import { Link } from '@tanstack/react-router';
import { t } from 'i18next';

import { Button, cn } from '@sovereign-university/ui';

import BCertificateImage from '../assets/about/b-certificate-presentation.webp';

interface BCertificatePresentationProps {
  marginClasses?: string;
}

export const BCertificatePresentation = ({
  marginClasses = 'mt-20',
}: BCertificatePresentationProps) => {
  return (
    <section
      className={cn(
        'w-full max-w-7xl flex max-lg:flex-col justify-center items-center gap-10 border border-darkOrange-5 shadow-sm-section rounded-[20px] px-12 py-16 mx-auto',
        marginClasses,
      )}
    >
      <img
        src={BCertificateImage}
        alt="B-Certificates"
        className="w-1/2 max-lg:w-full"
      />
      <div className="flex flex-col w-1/2 max-lg:w-full">
        <h3 className="mobile-h2 md:desktop-h4 mb-2.5">
          {t('bCertificate.knowledgeableBitcoin')}
        </h3>
        <span className="text-lg md:text-2xl font-medium leading-tight tracking-[0.25px] text-darkOrange-5 mb-2.5 lg:mb-10">
          {t('bCertificate.challengeYourself')}
        </span>
        <p className="md:desktop-h8 mobile-body2">
          {t('bCertificate.bCertificateDescription')}
        </p>
        <Link to="/b-certificate" className="max-lg:mx-auto mt-11">
          <Button variant="newPrimary" size="l" onHoverArrow>
            {t('bCertificate.checkout')}
          </Button>
        </Link>
      </div>
    </section>
  );
};
