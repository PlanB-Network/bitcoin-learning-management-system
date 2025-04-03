import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { CopyButton } from '../copy-button.js';
import { ReactPlayer } from '../react-player.js';

import { BlockquoteRenderer } from './Renderers/blockquote-renderer.js';
import { ParagraphRenderer } from './Renderers/paragraph-renderer.tsx';

const PresentationMarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        hr: () => <hr className="my-4" />,
        h1: ({ children }) => (
          <h1 className="max-lg:subtitle-small-caps-14px lg:subtitle-medium-caps-18px text-darkOrange-5">
            <div className="flex w-auto items-center">{children}</div>
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="max-lg:label-large-20px lg:display-small-32px">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="max-lg:title-medium-sb-18px lg:title-large-sb-24px">
            {children}
          </h3>
        ),
        p: ParagraphRenderer,
        a: ({ children, href = '' }) => {
          return (
            <a
              href={href}
              target="_blank"
              className="underline text-newBlue-1"
              rel="noreferrer"
            >
              {children}
            </a>
          );
        },
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-10 body-16px">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 body-16px">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 body-16px last:mb-0">{children}</li>
        ),
        table: ({ children }) => (
          <table className="w-full table-fixed border-collapse border border-blue-900">
            {children}
          </table>
        ),
        th: ({ children }) => (
          <th className="overflow-hidden text-ellipsis break-words border border-blue-900 px-2 py-1">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="overflow-hidden text-ellipsis break-words border border-blue-900 px-2 py-1">
            {children}
          </td>
        ),
        img: ({ src, alt }) =>
          src?.includes('youtube.com') ||
          src?.includes('youtu.be') ||
          src?.includes('rumble.com') ? (
            <div className="mx-auto mb-2 lg:max-w-[80%] rounded-lg pb-6">
              <div className="relative pt-[56.25%]">
                {src?.includes('youtube.com') || src?.includes('youtu.be') ? (
                  <ReactPlayer
                    width={'100%'}
                    height={'100%'}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    className="mx-auto mb-2 rounded-lg"
                    controls={true}
                    url={src}
                    src={alt}
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    className="mx-auto mb-2 rounded-lg"
                    src={src}
                    title={alt}
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          ) : (
            <img
              className="mx-auto flex justify-center rounded-lg pb-6"
              src={src}
              alt={alt}
            />
          ),
        blockquote: ({ children }) => (
          <BlockquoteRenderer mode={'light'}>{children}</BlockquoteRenderer>
        ),
        code({ className, children }) {
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
            <code className="bg-newGray-4 px-1.5 rounded-lg font-mono inline-block text-sm">
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[remarkGfm, rehypeUnwrapImages, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      urlTransform={(src) =>
        src.startsWith('http') ? src : `${assetPrefix}/${src}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};

export default PresentationMarkdownBody;
