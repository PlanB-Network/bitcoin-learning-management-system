import { cn } from '@sovereign-university/ui';

interface Props {
  currentLetter: string;
  setCurrentLetter: (v: string) => void;
}

export const LetterGroupButton = ({
  currentLetter,
  setCurrentLetter,
}: Props) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz '.split('');

  return (
    <div className="flex-grow flex flex-wrap gap-2 py-3 place-content-center">
      {alphabet.map((letter) => (
        <button
          className={cn(
            'btn bg-turquoise-200 text-2xl font-semibold text-black xl:h-[48px] rounded-full',
            ' hover:border-2 hover:border-gray-900',
            currentLetter === letter.toUpperCase() && ' bg-orange-600',
            letter === ' ' ? 'bg-transparent' : '',
            'h-10 w-11',
            '2xl:w-14 2xl:h-14',
          )}
          onClick={() => setCurrentLetter(letter.toUpperCase())}
        >
          {letter.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
