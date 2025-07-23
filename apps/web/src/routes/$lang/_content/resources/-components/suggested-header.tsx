import { Trans } from 'react-i18next';

import ThumbUp from '#src/assets/icons/thumb-up-pixelated.svg?react';

export const SuggestedHeader = ({
  text,
  placeholder,
}: {
  text: string;
  placeholder: string;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center md:justify-start mb-5 lg:mb-10 mx-auto w-fit text-center">
      <ThumbUp className="size-5 lg:size-8 mr-3 my-1 shrink-0 fill-newOrange-1" />
      <h3 className="items-center title-small-med-16px md:title-large-24px font-medium text-white mt-1">
        <Trans i18nKey={text}>
          <span className="text-darkOrange-5">
            {placeholder}
            {''}
          </span>
        </Trans>
      </h3>
    </div>
  );
};
