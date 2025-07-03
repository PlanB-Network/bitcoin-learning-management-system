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

const PresentationMarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        a: ({ children, href }) => (
          <LinkRenderer href={href}>{children}</LinkRenderer>
        ),
        blockquote: ({ children }) => (
          <BlockquoteRenderer mode={'light'}>{children}</BlockquoteRenderer>
        ),
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
        ),
        h1: ({ children }) => (
          <h1 className="max-lg:subtitle-small-caps-14px lg:subtitle-medium-caps-18px text-darkOrange-5">
            <div className="flex w-auto items-center">{children}</div>
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="max-lg:label-large-20px lg:display-small-32px">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="max-lg:title-medium-sb-18px lg:title-large-sb-24px">
            {children}
          </h3>
        ),
        hr: () => <hr className="my-4" />,
        img: ({ src, alt }) => (
          <ImageVideoRenderer header="none" src={src} alt={alt} />
        ),
        li: ({ children }) => (
          <li className="my-1 body-16px last:mb-0">{children}</li>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-10 body-16px">
            {children}
          </ol>
        ),
        p: ({ children }) => (
          <ParagraphRenderer header="none">{children}</ParagraphRenderer>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 body-16px">
            {children}
          </ul>
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

export default PresentationMarkdownBody;
