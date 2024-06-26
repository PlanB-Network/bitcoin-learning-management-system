import type React from 'react';
import { useState } from 'react';

const LetterButton: React.FC<{
  letter: string;
  selectedLetter: string | null;
  onClick: (letter: string) => void;
}> = ({ letter, selectedLetter, onClick }) => {
  return (
    <button
      className={`m-1 p-2 rounded-full size-8 flex items-center justify-center font-bold text-sm ${
        selectedLetter === letter
          ? 'bg-orange-500 text-white'
          : 'bg-[#1F242D] text-gray-300'
      } sm:size-10 sm:text-base md:size-12 md:text-lg`}
      onClick={() => onClick(letter)}
    >
      {letter}
    </button>
  );
};

export const AlphabetGlossary: React.FC<{
  onLetterSelect: (letter: string) => void;
}> = ({ onLetterSelect }) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    onLetterSelect(letter);
  };

  return (
    <div>
      {/* Grid for bigger screens  (md en adelante) */}
      <div className="hidden  md:grid md:mx-auto md:grid-cols-9  md:justify-center">
        {[...'ABCDEFGHI'].map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            selectedLetter={selectedLetter}
            onClick={handleLetterClick}
          />
        ))}
        {[...'JKLMNOPQR'].map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            selectedLetter={selectedLetter}
            onClick={handleLetterClick}
          />
        ))}
        {[...'RSTUVWXYZ'].map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            selectedLetter={selectedLetter}
            onClick={handleLetterClick}
          />
        ))}
      </div>
    </div>
  );
};
