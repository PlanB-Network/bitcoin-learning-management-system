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

const remarkMathOptions = {
  singleDollarTextMath: false,
};

const TutorialsMarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix: string;
}) => {
  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="title-large-sb-24px mt-6 md:mt-8 text-newBlack-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="subtitle-large-med-20px text-darkOrange-5">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h3 className="text-lg font-medium text-black">{children}</h3>
        ),
        p: ({ children }) => (
          <ParagraphRenderer header="logo">{children}</ParagraphRenderer>
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
          <ol className="flex list-decimal flex-col pl-10 text-base tracking-wide font-[450]">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col pl-10 text-base tracking-wide font-[450]">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 text-base tracking-wide last:mb-0 font-[450]">
            {children}
          </li>
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
      remarkPlugins={[
        remarkGfm,
        rehypeUnwrapImages,
        [remarkMath, remarkMathOptions],
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

export default TutorialsMarkdownBody;
