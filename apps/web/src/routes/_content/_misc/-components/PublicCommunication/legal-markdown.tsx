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
        p: ({ children }) => (
          <p className="leading-relaxed mb-5 text-start text-black">
            {children}
          </p>
        ),

        li: ({ children }) => (
          <li className="leading-relaxed mb-5 text-start text-black">
            {children}
          </li>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
