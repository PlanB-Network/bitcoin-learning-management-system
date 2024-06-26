import { cn } from '@sovereign-university/ui';

interface LetterButtonProps {
  letter: string;
  selectedLetter: string | null;
  onClick: (letter: string) => void;
}

interface AlphabetGlossaryProps {
  onLetterSelect: (letter: string) => void;
  selectedLetter: string | null;
}

const LetterButton = ({
  letter,
  selectedLetter,
  onClick,
}: LetterButtonProps) => {
  return (
    <button
      className={cn(
        'm-1 p-2 rounded-full size-8 flex items-center justify-center font-bold text-sm sm:size-10 sm:text-base md:size-12 md:text-lg',
        selectedLetter === letter
          ? 'bg-orange-500 text-white'
          : 'bg-[#1F242D] text-gray-300',
      )}
      onClick={() => onClick(letter)}
    >
      {letter}
    </button>
  );
};

export const AlphabetGlossary = ({
  onLetterSelect,
  selectedLetter,
}: AlphabetGlossaryProps) => {
  return (
    <div>
      <div className="hidden md:grid md:mx-auto md:grid-cols-9  md:justify-center">
        {[...'ABCDEFGHI'].map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            selectedLetter={selectedLetter}
            onClick={() => onLetterSelect(letter)}
          />
        ))}
        {[...'JKLMNOPQR'].map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            selectedLetter={selectedLetter}
            onClick={() => onLetterSelect(letter)}
          />
        ))}
        {[...'RSTUVWXYZ'].map((letter) => (
          <LetterButton
            key={letter}
            letter={letter}
            selectedLetter={selectedLetter}
            onClick={() => onLetterSelect(letter)}
          />
        ))}
      </div>
    </div>
  );
};
