import type React from 'react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryListProps {
  glossaryTerms: GlossaryTerm[];
  selectedLetter: string | null;
}

// Define el tipo para tus términos del glosario
export const GlossaryList: React.FC<GlossaryListProps> = ({
  glossaryTerms,
  selectedLetter,
}) => {
  return (
    <div className="container mx-auto px-4 md:py-8">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-400">
          <thead>
            <tr>
              <th className="p-4 text-left font-medium text-white">TERM</th>
              <th className="p-4 text-left font-medium text-white">
                DEFINITION
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {glossaryTerms.length > 0 ? (
              glossaryTerms.map((term) => (
                <tr key={term.term}>
                  <td className="p-4 text-orange-500 font-bold">{term.term}</td>
                  <td className="p-4 text-white">{term.definition}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-4 text-center text-white">
                  {selectedLetter
                    ? `For now, we don't have words for the letter ${selectedLetter}.`
                    : 'Select a letter to see the words.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button className="rounded-md border border-gray-400 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 px-6 py-2 transition-colors duration-300">
            Load more words
          </button>
        </div>
      </div>
      {glossaryTerms.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="rounded-full bg-gray-800 px-6 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring">
            Load more words
          </button>
        </div>
      )}
    </div>
  );
};
