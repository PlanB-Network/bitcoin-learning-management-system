import type React from 'react';

export const TdRenderer: React.FC<React.ComponentProps<'p'>> = (props) => {
  const { children } = props;

  return (
    <td className="overflow-hidden text-ellipsis break-words border border-blue-900 px-2 py-1 font-[450]">
      {children}
    </td>
  );
};
