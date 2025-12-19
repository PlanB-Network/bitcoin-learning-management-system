import type { JSX } from 'react';
export const StepMessage = ({
  title,
  headline,
  subHeadline,
  icon,
  actionButton,
}: {
  title: string;
  headline: string | JSX.Element;
  subHeadline?: string | JSX.Element;
  icon: JSX.Element;
  actionButton?: JSX.Element;
}) => {
  return (
    <section className="flex flex-col w-full gap-5 md:gap-7">
      <span className="text-neutral-500 subtitle-small-caps-14px md:subtitle-medium-caps-18px">
        {title}
      </span>
      {icon}
      <p className="text-center text-neutral-1000 subtitle-large-18px md:title-large-24px whitespace-pre-line max-w-[1042px] mx-auto">
        {headline}
      </p>
      {subHeadline && (
        <p className="text-center text-dashboardSectionText/75 md:text-neutral-1000 body-14px md:subtitle-large-18px whitespace-pre-line max-w-[1042px] mx-auto">
          {subHeadline}
        </p>
      )}
      {actionButton && (
        <div className="flex justify-center">{actionButton}</div>
      )}
    </section>
  );
};
