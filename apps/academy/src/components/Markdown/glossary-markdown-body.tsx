import ReactMarkdown from 'react-markdown';
import rehypeMathjax from 'rehype-mathjax/svg';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { BlockquoteRenderer } from './Renderers/blockquote-renderer.js';
import { CodeRenderer } from './Renderers/code-renderer.tsx';
import { ImageVideoRenderer } from './Renderers/image-video-renderer.tsx';
import { LinkRenderer } from './Renderers/link-renderer.tsx';
import { ParagraphRenderer } from './Renderers/paragraph-renderer.tsx';
import { TableRenderer } from './Renderers/table-renderer.tsx';
import { TdRenderer } from './Renderers/td-renderer.tsx';

const GlossaryMarkdownBody = ({
  content,
  assetPrefix,
  isPreview,
}: {
  content: string;
  assetPrefix?: string;
  isPreview?: boolean;
}) => {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, href }) => (
          <LinkRenderer href={href} intent="glossary">
            {children}
          </LinkRenderer>
        ),
        blockquote: ({ children }) =>
          isPreview ? (
            <blockquote className="italic border-l-4 border-neutral-300 pl-4 my-2">
              {children}
            </blockquote>
          ) : (
            <BlockquoteRenderer mode={'light'}>{children}</BlockquoteRenderer>
          ),
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
        ),
        h2: ({ children }) => (
          <h2 className="mt-6 text-xl font-semibold text-black sm:mt-10 sm:text-2xl">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="ml-2 text-xl font-semibold text-black">{children}</h3>
        ),
        img: ({ src, alt }) => <ImageVideoRenderer src={src} alt={alt} />,
        li: ({ children }) => (
          <li className="my-1 mobile-body2 md:desktop-body1 last:mb-0 text-black">
            {children}
          </li>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-4 md:pl-10 text-base text-black py-1">
            {children}
          </ol>
        ),
        p: ({ children }) => (
          <ParagraphRenderer
            intent={isPreview ? 'glossary-preview' : 'glossary'}
          >
            {children}
          </ParagraphRenderer>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-4 md:pl-10 text-base text-black py-1">
            {children}
          </ul>
        ),
      }}
      remarkPlugins={[remarkGfm, rehypeUnwrapImages, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      urlTransform={(src) =>
        src.startsWith('http') ? src : `${assetPrefix}/${src.replace('./', '')}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};

export default GlossaryMarkdownBody;
