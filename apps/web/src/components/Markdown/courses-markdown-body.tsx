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

const CoursesMarkdownBody = ({
  content,
  assetPrefix,
  supportInlineLatex = false,
}: {
  content: string;
  assetPrefix: string;
  supportInlineLatex: boolean;
}) => {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="max-lg:title-large-sb-24px lg:text-3xl leading-snug text-darkOrange-5">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="max-lg:title-medium-sb-18px lg:text-2xl leading-snug text-darkOrange-5">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-2xl font-medium">{children}</h3>
        ),
        p: ({ children }) => (
          <ParagraphRenderer header="logo">{children}</ParagraphRenderer>
        ),
        img: ({ src, alt }) => (
          <ImageVideoRenderer header="logo" src={src} alt={alt} />
        ),
        a: ({ children, href }) => (
          <LinkRenderer href={href}>{children}</LinkRenderer>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-10 body-16px font-[450]">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 body-16px font-[450]">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 body-16px last:mb-0 font-[450]">{children}</li>
        ),
        table: ({ children }) => <TableRenderer>{children}</TableRenderer>,
        th: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        td: ({ children }) => <TdRenderer>{children}</TdRenderer>,
        blockquote: ({ children }) => (
          <BlockquoteRenderer mode={'light'}>{children}</BlockquoteRenderer>
        ),
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
        ),
      }}
      remarkPlugins={[
        remarkGfm,
        rehypeUnwrapImages,
        [
          remarkMath,
          {
            singleDollarTextMath: supportInlineLatex,
          },
        ],
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

export default CoursesMarkdownBody;
