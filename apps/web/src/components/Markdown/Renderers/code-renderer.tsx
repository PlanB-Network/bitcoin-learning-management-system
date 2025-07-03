import { CopyButton, cn } from '@blms/ui';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const codeStyles = cva('text-base tracking-wide', {
  defaultVariants: {
    intent: 'default',
  },
  variants: {
    intent: {
      default: 'bg-newGray-4 px-1.5 rounded-lg font-mono inline-block text-sm',
      glossary:
        'bg-white/20 px-1.5 rounded-lg font-mono inline-block text-sm text-white',
    },
  },
});

interface CodeRendererProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof codeStyles> {
  children?: React.ReactNode;
  className?: string;
  intent?: 'default' | 'glossary';
}

export const CodeRenderer: React.FC<CodeRendererProps> = (props) => {
  const { children, className, intent } = props;
  const childrenText = String(children).replace(/\n$/, '');

  // Default to treating as inline code
  let isCodeBlock = false;

  if ((className || '').startsWith('language-')) {
    isCodeBlock = true;
  } else if (!className && children) {
    // If it contains line breaks, treat as a code block
    isCodeBlock = String(children).includes('\n');
  }

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
        style={atomDark}
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
