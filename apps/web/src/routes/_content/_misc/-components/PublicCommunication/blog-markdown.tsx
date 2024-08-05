import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import type { JoinedBlogLight } from '@blms/types';

import { computeAssetCdnUrl } from '#src/utils/index.js';

const getBlog = (url: string, blogs: JoinedBlogLight[]) => {
  const pattern = /^https:\/\/planb\.network\/blogs\/(\d+)$/;
  const match = url.match(pattern);

  if (match) {
    const blogId = Number(match[1]);
    return blogs.find((blog) => blog.id === blogId) || null;
  }

  return null;
};

export const BlogMarkdownBody = ({
  content,
  assetPrefix,
  blogs,
}: {
  content: string;
  assetPrefix: string;
  blogs: JoinedBlogLight[];
}) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl mb-4 text-black">
            <div className="flex w-auto items-center text-start font-medium">
              {children}
            </div>
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl mb-4 text-black font-medium">
            <div className="flex w-auto items-center text-start">
              {children}
            </div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl mb-4 text-black font-medium text-start">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-xl mb-4 text-black font-medium text-start">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <div className=" text-black mb-4 text-base tracking-wide md:text-justify text-start">
            {children}
          </div>
        ),
        a: ({ children, href = '' }) => {
          const blog = getBlog(href, blogs);
          if (blog) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex max-md:flex-col items-center w-full bg-newGray-6 shadow-course-navigation border border-newGray-5 rounded-[20px] p-4 gap-6 max-md:max-w-96"
              >
                <img
                  src={computeAssetCdnUrl(
                    blog.lastCommit,
                    `${blog.path}/assets/thumbnail.webp`,
                  )}
                  alt={blog.name}
                  className="size-20 rounded-full"
                />
                <div className="flex flex-col max-md:text-center">
                  <span className="capitalize text-xl font-semibold text-darkOrange-5 mb-1">
                    {blog.name}
                  </span>
                  <p className="text-newBlack-3 text-xs font-light mb-2">
                    {blog.description}
                  </p>
                  <div className="flex gap-4 max-md:justify-center">
                    {blog.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[rgba(204,204,204,0.5)] px-2 py-1 rounded-md desktop-typo1 text-newBlack-3"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
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
            </div>
          ) : (
            <code className="bg-newGray-4 px-1.5 rounded-lg font-mono inline-block text-sm">
              {children}
            </code>
          );
        },
      }}
      urlTransform={(src) =>
        src.startsWith('http') ? src : `${assetPrefix}/${src}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};
