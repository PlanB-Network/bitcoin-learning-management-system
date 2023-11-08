import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import ReactPlayer from 'react-player/youtube';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';

import YellowPen from '../../assets/courses/pencil.svg?react';
import VideoSVG from '../../assets/resources/video.svg?react';

const { useGreater } = BreakPointHooks(breakpointsTailwind);

export const MarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix: string;
}) => {
  const isScreenSm = useGreater('sm');

  return (
    <ReactMarkdown
      children={content}
      components={{
        h2: ({ children }) => (
          <h2 className="mt-6 text-xl font-semibold text-orange-600 sm:mt-10 sm:text-2xl ">
            <div className="flex  w-auto items-center">
              <YellowPen className="mr-2 h-6 w-6 bg-contain sm:hidden " />
              {children}
            </div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="ml-2 text-xl font-semibold text-orange-500">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className=" text-blue-1000 text-justify text-base tracking-wide">
            {children}
          </p>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            className=" text-blue-500 "
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col px-10 text-justify text-base tracking-wide">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col px-10 text-justify text-base tracking-wide">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 text-justify text-base tracking-wide last:mb-0">
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
                <VideoSVG className="mb-2 ml-14 h-10 w-10" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-blue-900">Video</p>
                </div>
              </div>
              <div>
                <ReactPlayer
                  width={'auto'}
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
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <SyntaxHighlighter
              {...props}
              children={String(children).replace(/\n$/, '')}
              style={atomDark}
              language={match ? match[1] : undefined}
              PreTag="div"
            />
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[remarkGfm, remarkUnwrapImages, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      transformImageUri={(src) =>
        uriTransformer(src.startsWith('http') ? src : `${assetPrefix}/${src}`)
      }
    />
  );
};
