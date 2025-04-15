import ReactMarkdown from 'react-markdown';

import type { JoinedBlogLight } from '@blms/types';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { CodeRenderer } from './Renderers/code-renderer.tsx';
import { ImageVideoRenderer } from './Renderers/image-video-renderer.tsx';
import { LinkRenderer } from './Renderers/link-renderer.tsx';
import { ParagraphRenderer } from './Renderers/paragraph-renderer.tsx';
import { TableRenderer } from './Renderers/table-renderer.tsx';
import { TdRenderer } from './Renderers/td-renderer.tsx';

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
          <ParagraphRenderer intent="blog" header="text">
            {children}
          </ParagraphRenderer>
        ),
        img: ({ src, alt }) => (
          <ImageVideoRenderer header="text" src={src} alt={alt} />
        ),
        a: ({ children, href }) => (
          <LinkRenderer href={href} blogs={blogs}>
            {children}
          </LinkRenderer>
        ),
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
          <li className="leading-relaxed mb-5 text-start text-black">
            {children}
          </li>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
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
