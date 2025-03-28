import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import type { JoinedCourse, JoinedTutorialLight } from '@blms/types';

import { CourseCard } from '#src/organisms/course-card.tsx';
import { TutorialCard } from '#src/routes/$lang/_content/tutorials/-components/tutorial-card.tsx';

import VideoSVG from '../../assets/resources/video.svg?react';
import { CopyButton } from '../copy-button.tsx';
import { ReactPlayer } from '../react-player.tsx';

import { useEffect, useRef } from 'react';
import { Blockquote } from './blockquote.tsx';
import { getCourse, getTutorial } from './utils/link-preview.tsx';

const TradingViewWidget = ({
  symbol,
  height,
}: {
  symbol: string;
  height: number;
}) => {
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const currentContainer = container.current;
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `{
      "autosize": true,
      "height": "${height}",
      "symbol": "${symbol}",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "support_host": "https://www.tradingview.com"
    }`;
    currentContainer.innerHTML = '';
    currentContainer.appendChild(script);
  }, [symbol, height]);

  return <div ref={container} />;
};

const CoursesMarkdownBody = ({
  content,
  assetPrefix,
  tutorials,
  courses,
  supportInlineLatex = false,
}: {
  content: string;
  assetPrefix: string;
  tutorials: JoinedTutorialLight[];
  courses: JoinedCourse[];
  supportInlineLatex: boolean;
}) => {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="max-lg:title-large-sb-24px lg:text-3xl leading-snug text-darkOrange-5">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="max-lg:title-medium-sb-18px lg:text-2xl leading-snug text-darkOrange-5">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-2xl font-medium">{children}</h3>
        ),
        p: ({ children }) => {
          if (
            typeof children === 'string' &&
            children.includes(':::tradingview')
          ) {
            const str = children
              .replace(':::tradingview', '')
              .replace(':::', '')
              .trim();
            const symbol = str.match(/SYMBOL=([A-Z]+)/)?.[1] ?? 'BTCUSD';
            const height = Number.parseInt(
              str.match(/HEIGHT=(\d+)/)?.[1] ?? '500',
              10,
            );
            return (
              <TradingViewWidget symbol={symbol} height={Number(height)} />
            );
          }

          if (
            Array.isArray(children) &&
            children.length === 1 &&
            typeof children[0] === 'string'
          ) {
            return <p className="text-blue-1000 body-16px">{children}</p>;
          }

          return <div className="text-blue-1000 body-16px">{children}</div>;
        },
        a: ({ children, href = '' }) => {
          const tutorial = getTutorial(href, tutorials);
          if (tutorial) {
            return <TutorialCard tutorial={tutorial} href={href} addMargin />;
          }

          const course = getCourse(href, courses);
          if (course) {
            return (
              <div className="w-full max-w-[500px] md:max-w-[340px] max-md:mx-auto py-2 md:py-1 md:mx-2 md:inline-block md:overflow-hidden">
                <CourseCard course={course} mode="light" />
              </div>
            );
          }

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
            <div className="mx-auto mb-2 max-w-full rounded-lg pb-6">
              <div className="flex items-center">
                <VideoSVG className="mb-2 ml-4 size-10" />
                <div className="ml-2">
                  <p className="text-lg font-medium text-blue-900">Video</p>
                </div>
              </div>
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
          <Blockquote mode={'light'}>{children}</Blockquote>
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
      remarkPlugins={[
        remarkGfm,
        rehypeUnwrapImages,
        [
          remarkMath,
          {
            singleDollarTextMath: supportInlineLatex,
          },
        ],
      ]}
      rehypePlugins={[rehypeMathjax]}
      urlTransform={(src) =>
        src.startsWith('http') ? src : `${assetPrefix}/${src}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};

export default CoursesMarkdownBody;
