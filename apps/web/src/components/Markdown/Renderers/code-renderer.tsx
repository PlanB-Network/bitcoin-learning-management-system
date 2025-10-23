import { CopyButton } from '@blms/ui';
import type React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeRendererProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  className?: string;
}
export const CodeRenderer: React.FC<CodeRendererProps> = ({
  children,
  className,
}) => {
  const childrenText = String(children).replace(/\n$/, '');

  const isCodeBlock =
    (className || '').startsWith('language-') ||
    (!className && String(children).includes('\n'));

  const languageMatch = /language-(\w+)/.exec(className || '');
  const language = languageMatch
    ? languageMatch[1] === 'text'
      ? 'plaintext'
      : languageMatch[1]
    : 'plaintext';

  const shouldWrapLines =
    !languageMatch || ['text', 'plaintext'].includes(language);

  return isCodeBlock ? (
    <div className="relative">
      <SyntaxHighlighter
        style={oneLight}
        language={language}
        wrapLines={shouldWrapLines}
        PreTag="div"
      >
        {childrenText}
      </SyntaxHighlighter>
      <CopyButton text={childrenText} />
    </div>
  ) : (
    <code
      className={
        'bg-[#fafafa] text-[#383A42] text-left whitespace-pre break-normal leading-normal p-0.5 overflow-auto rounded-[0.3em] font-mono'
      }
    >
      {children}
    </code>
  );
};
