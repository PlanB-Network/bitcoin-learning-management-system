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
        a: ({ children, href }) => (
          <LinkRenderer href={href}>{children}</LinkRenderer>
        ),
        blockquote: ({ children }) => (
          <BlockquoteRenderer mode={'light'}>{children}</BlockquoteRenderer>
        ),
        code: ({ className, children }) => (
          <CodeRenderer className={className}>{children}</CodeRenderer>
        ),
        h2: ({ children }) => (
          <h2 className="title-medium lg:title-large text-orange-500">
            <div className="flex w-auto items-center">{children}</div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="title-base lg:title-medium leading-snug text-orange-500">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="title-small lg:title-base">{children}</h4>
        ),
        img: ({ src, alt }) => <ImageVideoRenderer src={src} alt={alt} />,
        li: ({ children }) => (
          <li className="my-1 body-16px last:mb-0">{children}</li>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col pl-10 body-16px">
            {children}
          </ol>
        ),
        p: ({ children }) => (
          <ParagraphRenderer header="logo">{children}</ParagraphRenderer>
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
        src.startsWith('http') || src.startsWith('/')
          ? src
          : `${assetPrefix}/${src}`
      }
    >
      {content}
    </ReactMarkdown>
  );
};

export default CoursesMarkdownBody;
