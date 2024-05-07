import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax/svg';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';

import { CopyButton } from '../CopyButton/index.tsx';

const fixEmbedUrl = (src: string) => {
  if (src.includes('embed')) {
    return src;
  }

  switch (true) {
    case src.includes('youtu.be'): {
      return src.replace('youtu.be/', 'youtube.com/embed/');
    }
    case src.includes('youtube.com'): {
      return src.replace('youtube.com/', 'youtube.com/embed/');
    }
    case src.includes('peertube.planb.network'): {
      return src.replace(
        'peertube.planb.network/videos/',
        'peertube.planb.network/videos/embed/',
      );
    }
    case src.includes('makertube.net'): {
      return src.replace('makertube.net/w/', 'makertube.net/videos/embed/');
    }
    default: {
      return src;
    }
  }
};

export const ConferencesMarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix?: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="mt-6 text-xl font-semibold text-white sm:mt-10 sm:text-2xl ">
            <div className="flex  w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="ml-2 text-xl font-semibold text-white">{children}</h3>
        ),
        p: ({ children }) => (
          <div className="desktop-subtitle1 text-newGray-1">{children}</div>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            className="underline text-newBlue-1"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col px-10 text-base tracking-wide md:text-justify">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col px-10 text-base tracking-wide md:text-justify">
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
          src?.includes('youtube.com') ||
          src?.includes('youtu.be') ||
          src?.includes('peertube') ||
          src?.includes('makertube') ? (
            <div className="mx-auto max-w-full mb-2.5 md:mb-5 w-full aspect-video">
              <iframe
                width={'100%'}
                height={'100%'}
                className="mx-auto mb-2 rounded-lg"
                src={fixEmbedUrl(src)}
                title="Conference Replay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <img
              className="mx-auto flex justify-center rounded-lg py-6"
              src={src}
              alt={alt}
            />
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

          return isCodeBlock ? (
            <div className="relative">
              <SyntaxHighlighter
                style={atomDark}
                language={/language-(\w+)/.exec(className || '')?.[1] || 'text'}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
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
      remarkPlugins={[remarkGfm, remarkUnwrapImages, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      urlTransform={(src) =>
        src.startsWith('http') ? src : `${assetPrefix}/${src}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};
