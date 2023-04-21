import { Tooltip } from 'primereact/tooltip';

import { errorMessage } from './index.css';

interface ErrorMessageProps {
  text?: string;
}

export const ErrorMessage = ({ text }: ErrorMessageProps) => {
  if (!text) return null;
  return (
    <>
      <Tooltip target="#error" />
      <small
        id="error"
        data-pr-tooltip={text}
        data-pr-position="bottom"
        className={errorMessage}
      >
        {text}
      </small>
    </>
  );
};
