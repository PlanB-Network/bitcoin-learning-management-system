import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import CircuitLeft from '#src/assets/certificates/circuit-left.svg';
import CircuitRight from '#src/assets/certificates/circuit-right.svg';
import { PageLayout } from '#src/components/page-layout.js';
import { useGreater } from '#src/hooks/use-greater.js';
import { ButtonWithArrow } from '#src/molecules/button-arrow.js';

export const Route = createFileRoute(
  '/$lang/_content/_misc/bcert-certificates/$certificateId',
)({
  params: {
    parse: (params) => ({
      lang: z.string().parse(params.lang),
      certificateId: z.string().parse(params.certificateId),
    }),
    stringify: ({ lang, certificateId }) => ({
      lang: lang,
      certificateId: `${certificateId}`,
    }),
  },
  component: Certificate,
});

function Certificate() {
  const { t } = useTranslation();
  const isScreenMd = useGreater('md');
  const params = Route.useParams();
  const navigate = useNavigate();

  const certificateName = decodeURIComponent(params.certificateId);

  const regex = /\/([^/]+)\/([^/]+)$/;

  const match = certificateName.match(regex);

  const username = match ? match[1] : null;
  const capitalizedUsername = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : null;
  if (!params.certificateId.startsWith('bcertresults')) {
    navigate({
      to: '/',
    });
  }

  return (
    <PageLayout footerVariant="dark" variant="dark" maxWidth="max-w-[1392px]">
      <h2 className="text-center display-small-32px lg:display-large">
        {t('words.bCertificate')}
      </h2>
      <p className="text-center max-w-[848px] body-14px lg:label-large-20px mx-auto mt-[35px] lg:mt-[80px]">
        {t('courses.exam.bCertificateCompletionText', {
          username: capitalizedUsername,
        })}
      </p>
      <div className="flex flex-col w-full items-center py-8 md:pt-[40px] md:pb-[80px] font-light md:font-normal px-4 text-center lg:text-start">
        {/* Certificate with Circuits */}
        <div className="relative flex items-center justify-center w-full ">
          {/* Left Circuit */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block z-0">
            <img
              className="h-auto max-w-[795px] w-full"
              src={CircuitLeft}
              alt={t('imagesAlt.printedCircuits')}
              loading="lazy"
            />
          </div>

          {/* Certificate */}
          <div className="relative z-10 flex justify-center">
            <img
              src={`/api/files/${decodeURI(params.certificateId)}.png`}
              alt="Certificate"
              className="w-full max-w-[842px] shadow-l-section"
            />
          </div>

          {/* Right Circuit */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block z-0">
            <img
              className="h-auto max-w-[795px] w-full"
              src={CircuitRight}
              alt={t('imagesAlt.printedCircuits')}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[266px] md:max-w-[563px] mx-auto text-center">
        <h3 className="max-md:title-medium-sb-18px md:desktop-h4 mb-1 md:mb-2.5">
          {t('bCertificate.knowledgeableBitcoin')}
        </h3>
        <span className="max-md:label-medium-16px md:text-2xl font-medium leading-tight tracking-[0.25px] text-darkOrange-5">
          {t('bCertificate.challengeYourself')}
        </span>
        <p className="md:desktop-h8 body-16px  mt-4 lg:mt-8">
          {t('bCertificate.bCertificateDescription')}
        </p>
        <Link to="/b-cert" className="flex justify-center mt-[15px] md:mt-8">
          <ButtonWithArrow variant="primary" size={isScreenMd ? 'l' : 'm'}>
            {t('courses.exam.buttonTextBCert')}
          </ButtonWithArrow>
        </Link>
      </div>
    </PageLayout>
  );
}
