import ReactMarkdown from 'react-markdown';
import rehypeMathjax from 'rehype-mathjax';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import YellowPen from '../../assets/courses/pencil.svg?react';

import { BlockquoteRenderer } from './Renderers/blockquote-renderer.js';
import { CodeRenderer } from './Renderers/code-renderer.tsx';
import { ImageVideoRenderer } from './Renderers/image-video-renderer.tsx';
import { LinkRenderer } from './Renderers/link-renderer.tsx';
import { ParagraphRenderer } from './Renderers/paragraph-renderer.tsx';
import { TableRenderer } from './Renderers/table-renderer.tsx';
import { TdRenderer } from './Renderers/td-renderer.tsx';

const GeneralMarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h2 className="mt-6 text-2xl font-bold text-orange-600 sm:mt-10 sm:text-3xl ">
            <div className="flex  w-auto items-center">
              <YellowPen className="mr-2 size-6 bg-contain sm:hidden " />
              {children}
            </div>
          </h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-6 text-3xl font-semibold text-orange-600 sm:mt-10 sm:text-2xl ">
            <div className="flex w-auto items-center">
              <YellowPen className="mr-2 size-6 bg-contain sm:hidden " />
              {children}
            </div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-3xl font-medium text-orange-500">{children}</h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-2xl font-medium">{children}</h3>
        ),
        p: ({ children }) => (
          <ParagraphRenderer intent="general" header="logo">
            {children}
          </ParagraphRenderer>
        ),
        img: ({ src, alt }) => (
          <ImageVideoRenderer header="logo" src={src} alt={alt} />
        ),
        a: ({ children, href }) => (
          <LinkRenderer href={href} intent="general">
            {children}
          </LinkRenderer>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-10 text-base tracking-wide">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 text-base tracking-wide">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 text-base tracking-wide last:mb-0">{children}</li>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        blockquote: ({ children }) => (
          <BlockquoteRenderer mode="light">{children}</BlockquoteRenderer>
        ),
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
        ),
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

export default GeneralMarkdownBody;
