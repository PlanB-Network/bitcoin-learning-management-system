import { Link } from '@tanstack/react-router';
import { Trans } from 'react-i18next';

import { cn } from '@blms/ui';

export const PageHeader = ({
  title,
  subtitle,
  description = '',
  link,
  hasGithubDescription = false,
  addedCredits = false,
  hideOnMobile,
  removeTopMargin,
  increaseHorizontalPadding,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  hasGithubDescription?: boolean;
  addedCredits?: boolean;
  hideOnMobile?: boolean;
  removeTopMargin?: boolean;
  increaseHorizontalPadding?: boolean;
}) => {
  const isSubsectionTitle = subtitle ? false : true;

  return (
    <div
      className={cn(
        'flex flex-col',
        hideOnMobile && 'max-md:hidden',
        removeTopMargin ? '' : 'mt-5 md:mt-10',
        increaseHorizontalPadding ? 'max-lg:px-6' : 'max-lg:px-4',
      )}
    >
      {subtitle && (
        <h1 className="text-center text-sm md:text-2xl text-newOrange-1 font-medium md:font-semibold leading-tight md:leading-relaxed md:tracking-015px max-md:mb-2 mb-1">
          {subtitle}
        </h1>
      )}

      {link ? (
        <Link to={link}>
          <PageTitle title={title} isSubsectionTitle={isSubsectionTitle} />
        </Link>
      ) : (
        <PageTitle title={title} isSubsectionTitle={isSubsectionTitle} />
      )}

      {hasGithubDescription ? (
        <>
          <p className="max-w-4xl mx-auto text-center text-xs md:desktop-subtitle1 text-newGray-1 leading-[1.66] tracking-[0.4px] mt-1 md:mt-6">
            <Trans i18nKey="resources.github">
              <a
                className="underline underline-offset-2 hover:text-darkOrange-5"
                href="https://github.com/PlanB-Network/bitcoin-educational-content"
                target="_blank"
                rel="noreferrer"
              >
                Github Repository
              </a>
            </Trans>
          </p>

          {addedCredits && (
            <p className="max-w-4xl mx-auto text-center text-xs md:desktop-subtitle1 text-newGray-1 leading-[1.66] tracking-[0.4px] mt-1">
              <Trans i18nKey="glossary.creditsLoic">
                <span className="font-semibold">Credits</span>
                <a
                  className="underline underline-offset-2 hover:text-darkOrange-5"
                  href="https://github.com/LoicPandul/Dictionnaire-de-Bitcoin/tree/main"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bitcoin Dictionnary Github Repository
                </a>
              </Trans>
            </p>
          )}
        </>
      ) : (
        description && (
          <p className="max-w-4xl mx-auto text-center text-xs md:desktop-subtitle1 text-newGray-1 leading-[1.66] tracking-[0.4px]  mt-1 md:mt-6 max-md:hidden">
            {description}
          </p>
        )
      )}
    </div>
  );
};

const PageTitle = ({
  title,
  isSubsectionTitle,
}: {
  title: string;
  isSubsectionTitle: boolean;
}) => {
  return (
    <h2
      className={cn(
        isSubsectionTitle
          ? 'text-lg md:text-[40px] text-darkOrange-5 tracking-[0.25px] font-medium'
          : 'text-[32px] md:text-6xl text-white md:font-light md:tracking-[-0.5px]',
        'text-center leading-[120%]',
      )}
    >
      {title}
    </h2>
  );
};
