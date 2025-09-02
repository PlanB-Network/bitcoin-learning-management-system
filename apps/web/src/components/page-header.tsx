import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { Trans } from 'react-i18next';

export const PageHeader = ({
  title,
  subtitle,
  description = '',
  link,
  hasGithubDescription = false,
  addedCredits = false,
  hideOnMobile,
  hideDescriptionOnMobile = true,
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
  hideDescriptionOnMobile?: boolean;
  removeTopMargin?: boolean;
  increaseHorizontalPadding?: boolean;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col',
        hideOnMobile && 'max-md:hidden',
        removeTopMargin ? '' : 'mt-5 md:mt-10',
        !hideDescriptionOnMobile
          ? 'px-0'
          : increaseHorizontalPadding
            ? 'max-lg:px-6'
            : 'max-lg:px-4',
      )}
    >
      {subtitle && (
        <h1 className="title-base text-black max-md:mb-2 mb-1">{subtitle}</h1>
      )}
      {link ? (
        <Link to={link}>
          <PageTitle title={title} />
        </Link>
      ) : (
        <PageTitle title={title} />
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
                  href="https://planb.network/en/professor/lo%C3%AFc-morel-50"
                  target="_blank"
                  rel="noreferrer"
                >
                  Loïc Morel (Pandul)
                </a>
                <a
                  className="underline underline-offset-2 hover:text-darkOrange-5"
                  href="https://github.com/LoicPandul/Dictionnaire-de-Bitcoin/tree/main"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github repository
                </a>
              </Trans>
            </p>
          )}
        </>
      ) : (
        description && (
          <p
            className={cn(
              'body-large text-neutral-600 mt-1 md:mt-6',
              hideDescriptionOnMobile
                ? 'max-md:hidden'
                : 'max-md:pb-12 max-md:border-b border-newGray-1 max-md:mt-5',
            )}
          >
            {description}
          </p>
        )
      )}
    </div>
  );
};

export const PageTitle = ({ title }: { title: string }) => {
  return (
    <h2 className={cn('display-base md:display-large text-black')}>{title}</h2>
  );
};
