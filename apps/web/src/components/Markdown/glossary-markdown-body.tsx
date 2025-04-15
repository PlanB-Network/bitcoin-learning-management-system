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
}: {
  content: string;
  assetPrefix?: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="mt-6 text-xl font-semibold text-white sm:mt-10 sm:text-2xl">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="ml-2 text-xl font-semibold text-white">{children}</h3>
        ),
        p: ({ children }) => (
          <ParagraphRenderer intent="glossary" header="none">
            {children}
          </ParagraphRenderer>
        ),
        img: ({ src, alt }) => (
          <ImageVideoRenderer header="none" src={src} alt={alt} />
        ),
        a: ({ children, href }) => (
          <LinkRenderer href={href} intent="glossary">
            {children}
          </LinkRenderer>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-4 md:pl-10 text-base text-white py-1">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-4 md:pl-10 text-base text-white py-1">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 mobile-body2 md:desktop-body1 last:mb-0 text-white">
            {children}
          </li>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        blockquote: ({ children }) => (
          <BlockquoteRenderer mode={'dark'}>{children}</BlockquoteRenderer>
        ),
        code: ({ className, children }) => (
          <CodeRenderer className={className} intent="glossary">
            {children}
          </CodeRenderer>
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
