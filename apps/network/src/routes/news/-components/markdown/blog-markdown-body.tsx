import type { JoinedBlogLight } from '@blms/types';
import ReactMarkdown from 'react-markdown';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeRenderer } from './Renderers/code-renderer.js';
import { ImageVideoRenderer } from './Renderers/image-video-renderer.js';
import { LinkRenderer } from './Renderers/link-renderer.js';
import { ParagraphRenderer } from './Renderers/paragraph-renderer.js';
import { TableRenderer } from './Renderers/table-renderer.js';
import { TdRenderer } from './Renderers/td-renderer.js';

const BlogMarkdownBody = ({
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
        a: ({ children, href }) => (
          <LinkRenderer href={href} blogs={blogs}>
            {children}
          </LinkRenderer>
        ),
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl mb-4">
            <div className="flex w-auto items-center text-start font-medium">
              {children}
            </div>
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl mb-4 font-medium">
            <div className="flex w-auto items-center text-start">
              {children}
            </div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl mb-4 font-medium text-start">{children}</h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-xl mb-4 font-medium text-start">{children}</h3>
        ),
        img: ({ src, alt }) => <ImageVideoRenderer src={src} alt={alt} />,
        li: ({ children }) => (
          <li className="leading-relaxed mb-5 text-start">{children}</li>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-10 text-base tracking-wide md:text-justify">
            {children}
          </ol>
        ),
        p: ({ children }) => (
          <ParagraphRenderer intent="blog">{children}</ParagraphRenderer>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 text-base tracking-wide md:text-justify">
            {children}
          </ul>
        ),
      }}
      remarkPlugins={[remarkGfm, rehypeUnwrapImages, [remarkMath, {}]]}
      rehypePlugins={[rehypeMathjax]}
      urlTransform={(src) =>
        src.startsWith('http') ? src : `${assetPrefix}/${src}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};

export default BlogMarkdownBody;
