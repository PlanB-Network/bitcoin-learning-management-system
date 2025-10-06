import type React from 'react';

export const TableRenderer: React.FC<React.ComponentProps<'p'>> = (props) => {
  const { children } = props;

  return (
    <table className="w-full table-fixed border-collapse border border-blue-900">
      {children}
    </table>
  );
};
