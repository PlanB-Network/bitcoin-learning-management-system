import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax/svg';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';

import type { JoinedTutorialLight } from '@blms/types';

import { TutorialCard } from '#src/routes/_content/tutorials/-components/tutorial-card.js';

import VideoSVG from '../../assets/resources/video.svg?react';
import { CopyButton } from '../copy-button.tsx';
import { ReactPlayer } from '../react-player.tsx';

import { Blockquote } from './blockquote.tsx';

const remarkMathOptions = {
  singleDollarTextMath: false,
};

const getTutorial = (url: string, tutorials: JoinedTutorialLight[]) => {
  const pattern = /^https:\/\/planb\.network\/tutorials\/([^/]+)\/([^/]+)$/;
  const match = url.match(pattern);

  if (match) {
    const tutorialName = match[2];
    return tutorials.find((tutorial) => tutorial.name === tutorialName) || null;
  }

  return null;
};

const TutorialsMarkdownBody = ({
  content,
  assetPrefix,
  tutorials,
}: {
  content: string;
  assetPrefix: string;
  tutorials: JoinedTutorialLight[];
}) => {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="title-large-sb-24px mt-6 md:mt-8 text-newBlack-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="subtitle-large-med-20px text-darkOrange-5">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-lg font-medium text-black">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-newBlack-1 body-16px md:text-justify">
            {children}
          </p>
        ),
        a: ({ children, href = '' }) => {
          const tutorial = getTutorial(href, tutorials);
          if (tutorial) {
            return <TutorialCard tutorial={tutorial} href={href} />;
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
          <ol className="flex list-decimal flex-col pl-10 text-base tracking-wide md:text-justify">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 text-base tracking-wide md:text-justify">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 text-base tracking-wide last:mb-0 md:text-justify">
            {children}
          </li>
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
          src?.includes('youtube.com') || src?.includes('youtu.be') ? (
            <div className="mx-auto mb-2 max-w-full rounded-lg py-6">
              <div className=" flex items-center">
                <VideoSVG className="mb-2 ml-14 size-10" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-blue-900">Video</p>
                </div>
              </div>
              <div className="relative pt-[56.25%]">
                <ReactPlayer
                  width={'100%'}
                  height={'100%'}
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  className="mx-auto mb-2 rounded-lg"
                  controls={true}
                  url={src}
                  src={alt}
                />
              </div>
            </div>
          ) : (
            <img
              className="mx-auto flex justify-center rounded-lg py-6"
              src={src}
              alt={alt}
            />
          ),
        blockquote: ({ children }) => (
          <Blockquote mode="light">{children}</Blockquote>
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
        remarkUnwrapImages,
        [remarkMath, remarkMathOptions],
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

export default TutorialsMarkdownBody;
