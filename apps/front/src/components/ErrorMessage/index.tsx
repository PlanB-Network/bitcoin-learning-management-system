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
        className="text-danger-300 w-64 overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {text}
      </small>
    </Tooltip>
  );
};
