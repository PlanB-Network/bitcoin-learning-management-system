import ReactMarkdown from 'react-markdown';

interface LegalMarkdownComponentProps {
  content?: string;
}

export const LegalMarkdownComponent = ({
  content,
}: LegalMarkdownComponentProps) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl mb-4 text-white">
            <div className="flex w-auto items-center text-start font-medium">
              {children}
            </div>
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl mb-4 text-white font-medium">
            <div className="flex w-auto items-center text-start">
              {children}
            </div>
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl mb-4 text-white font-medium text-start">
            {children}
          </h3>
        ),

        li: ({ children }) => (
          <li className="leading-relaxed mb-5 text-start text-white">
            {children}
          </li>
        ),
        p: ({ children }) => (
          <p className="text-xl leading-relaxed mb-5 text-start text-white">
            {children}
          </p>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
