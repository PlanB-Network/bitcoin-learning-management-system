import { ReactNode } from 'react';

const serialize = (s: string) => s.replaceAll(' ', '_');

export const Emphasize = ({
  children,
  words,
}: {
  children: string;
  words?: string[];
}) => {
  if (!words)
    return <span className="text-secondary-400 uppercase">{children}</span>;

  const replaced = words.reduce(
    (acc, s, index) => {
      const position = children.search(s);
      if (position === -1) return acc;

      const toReplaceStart = position;
      const toReplaceEnd = position + s.length;

      const [before, toReplace, after] = [
        [0, toReplaceStart],
        [toReplaceStart, toReplaceEnd],
        [toReplaceEnd, undefined],
      ].map(([s, e]) => acc.remainingString.slice(s, e));

      console.log({ before, toReplace, after });

      return {
        newNodes: [
          ...acc.newNodes,
          <span key={`${serialize(before)}-${index}`}>{before}</span>,
          <span
            key={`${serialize(toReplace)}-${index}`}
            className="text-secondary-400 uppercase"
          >
            {toReplace}
          </span>,
        ],
        remainingString: after,
      };
    },
    { newNodes: [] as ReactNode[], remainingString: children }
  );

  return (
    <span>
      {[
        ...replaced.newNodes,
        <span key="remaining">{replaced.remainingString}</span>,
      ]}
    </span>
  );
};
