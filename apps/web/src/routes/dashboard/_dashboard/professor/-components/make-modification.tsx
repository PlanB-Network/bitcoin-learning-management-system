import { Link } from '@tanstack/react-router';
import { Trans } from 'react-i18next';

interface MakeModificationBlockProps {
  title: string;
  titleLink: string;
  text: string;
  textLink: string;
}

export const MakeModificationBlock = ({
  title,
  titleLink,
  text,
  textLink,
}: MakeModificationBlockProps) => {
  return (
    <div className="flex flex-col gap-2.5 mt-6 lg:mt-10">
      <Link
        to={titleLink}
        className="w-fit underline underline-offset-2 text-darkOrange-5 hover:text-darkOrange-6 leading-tight lg:text-xl"
      >
        {title}
      </Link>
      <p className="label-normal-16px text-dashboardSectionText/75">
        <Trans i18nKey={text}>
          <Link
            className="text-newBlue-1 hover:text-darkOrange-5 underline underline-offset-2"
            to={textLink}
          >
            Link
          </Link>
        </Trans>
      </p>
    </div>
  );
};
