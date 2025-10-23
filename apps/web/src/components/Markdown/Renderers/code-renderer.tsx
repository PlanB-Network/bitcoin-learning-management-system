import { CopyButton, cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const codeStyles = cva('text-base tracking-wide', {
  defaultVariants: { intent: 'default' },
  variants: {
    intent: {
      default: 'bg-newGray-4 px-1.5 rounded-lg font-mono inline-block text-sm',
    },
  },
});

interface CodeRendererProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof codeStyles> {
  children?: React.ReactNode;
  className?: string;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({
  children,
  className,
  intent,
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
    <code className={cn(codeStyles({ intent }))}>{children}</code>
  );
};
