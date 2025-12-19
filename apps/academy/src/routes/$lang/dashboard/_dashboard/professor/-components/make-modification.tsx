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
        className="w-fit underline underline-offset-2 text-orange-500 hover:text-orange-600 leading-tight lg:text-xl"
      >
        {title}
      </Link>
      <p className="label-normal-16px text-dashboardSectionText/75">
        <Trans i18nKey={text}>
          <Link
            className="text-blue-500 hover:text-orange-500 underline underline-offset-2"
            to={textLink}
          >
            Link
          </Link>
        </Trans>
      </p>
    </div>
  );
};
