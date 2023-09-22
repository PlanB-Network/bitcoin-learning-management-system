import ReactMarkdown, { uriTransformer } from 'react-markdown';
import ReactPlayer from 'react-player/youtube';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkUnwrapImages from 'remark-unwrap-images';

import { ReactComponent as VideoSVG } from '../../assets/resources/video.svg';

export const MarkdownBody = ({
  content,
  assetPrefix,
}: {
  content: string;
  assetPrefix: string;
}) => {
  return (
    <ReactMarkdown
      children={content}
      components={{
        h2: ({ children }) => (
          <h2 className="mt-6 text-xl font-semibold md:mt-10 md:text-2xl">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-normal">{children}</h3>
        ),
        p: ({ children }) => (
          <p className=" text-justify text-base tracking-wide ">{children}</p>
        ),
        ol: ({ children }) => (
          <ol className="flex list-decimal flex-col px-10 text-justify text-base tracking-wide">
            {children}
          </ol>
        ),
        ul: ({ children }) => (
          <ul className="flex list-disc flex-col px-10 text-justify text-base tracking-wide">
            {children}
          </ul>
        ),
        li: ({ children }) => (
          <li className="my-1 text-justify text-base tracking-wide last:mb-0">
            {children}
          </li>
        ),
        table: ({ children }) => (
          <table className="border-primary-900 w-full border-collapse border">
            {children}
          </table>
        ),
        th: ({ children }) => (
          <th className="border-primary-900 border px-2 py-1">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border-primary-900 border px-2 py-1">{children}</td>
        ),
        // Aqui va la seccion del icono del video es funcional pero debo mejorarla
        img: ({ src, alt }) =>
          src?.includes('youtube.com') || src?.includes('youtu.be') ? (
            <div className="mx-auto mb-2 max-w-full rounded-lg py-6">
              <div className=" flex items-center">
                <VideoSVG className="mb-2 ml-14 h-10 w-10" />{' '}
                <div className="ml-2">
                  <p className="text-primary-800 text-sm font-medium">Video</p>
                </div>
              </div>
              <ReactPlayer
                className="mx-auto mb-2 max-w-full rounded-lg"
                controls={true}
                url={src}
                src={alt}
              />
            </div>
          ) : (
            <img
              className="mx-auto flex justify-center rounded-lg py-6"
              src={src}
              alt={alt}
            />
          ),
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <SyntaxHighlighter
              {...props}
              children={String(children).replace(/\n$/, '')}
              style={atomDark}
              language={match ? match[1] : undefined}
              PreTag="div"
            />
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
      remarkPlugins={[remarkGfm, remarkUnwrapImages, remarkMath]}
      rehypePlugins={[rehypeMathjax]}
      transformImageUri={(src) =>
        uriTransformer(src.startsWith('http') ? src : `${assetPrefix}/${src}`)
      }
    />
  );
};
