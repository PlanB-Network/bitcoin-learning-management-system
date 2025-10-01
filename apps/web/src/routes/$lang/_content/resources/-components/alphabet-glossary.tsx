import { cn } from '@blms/ui';

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
      type="button"
      onClick={() => onClick(letter)}
      className={cn(
        'flex justify-center items-center shrink-0 size-[32px] text-xs rounded-full',
        selectedLetter === letter
          ? 'bg-orange-500 text-white'
          : 'bg-neutral-50 text-neutral-700',
      )}
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
      <div className="hidden sm:flex flex-wrap gap-1.5 mt-4">
        {[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter) => (
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
