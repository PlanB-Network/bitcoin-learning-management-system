import { Trans } from 'react-i18next';

export const SuggestedHeader = ({ text }: { text: string }) => {
  return (
    <h3 className="subtitle-base md:subtitle-large-med-20px">
      <Trans i18nKey={text}>
        <span>{text}</span>
      </Trans>
    </h3>
  );
};
