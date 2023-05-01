import { useMemo } from 'react';

import { compose } from '../../utils';

interface TooltipProps {
  text: string;
  inline?: boolean;
  children: JSX.Element;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const classesByPosition = {
  top: '-translate-y-full -top-2 -translate-x-1/2 left-1/2',
  bottom: 'translate-y-full bottom-0 -translate-x-1/2 left-1/2',
  left: 'right-full -translate-y-1/2 top-1/2',
  right: 'left-full -translate-y-1/2 top-1/2',
};

export const Tooltip = ({ inline, children, text, position }: TooltipProps) => {
  const containerClasses = 'relative group';

  const tooltipClasses = useMemo(
    () => [
      'absolute z-[1000] p-2 text-xs text-white bg-gray-600 rounded transition-all scale-0 group-hover:scale-100 w-max max-w-full',
      classesByPosition[position ?? 'bottom'],
    ],
    [position]
  );

  if (inline)
    return (
      <span className={containerClasses}>
        {children}
        <span className={compose(...tooltipClasses)}>{text}</span>
      </span>
    );

  return (
    <div className={compose(containerClasses, 'w-max')}>
      {children}
      <span className={compose(...tooltipClasses)}>{text}</span>
    </div>
  );
};
