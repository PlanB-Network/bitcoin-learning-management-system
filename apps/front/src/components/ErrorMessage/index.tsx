import { Tooltip } from '../../atoms/Tooltip';

interface ErrorMessageProps {
  text?: string;
}

export const ErrorMessage = ({ text }: ErrorMessageProps) => {
  if (!text) return null;
  return (
    <Tooltip text="text">
      <small
        data-pr-tooltip={text}
        data-pr-position="bottom"
        className="overflow-hidden w-64 whitespace-nowrap text-danger-300 text-ellipsis"
      >
        {text}
      </small>
    </Tooltip>
  );
};
