import { useState } from 'react';
import { LuCopy, LuCopyCheck } from 'react-icons/lu';

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 250);
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className="absolute top-1 right-1 sm:top-2 sm:right-2 text-white"
      aria-label="Copy to Clipboard"
    >
      {isClicked ? <LuCopyCheck /> : <LuCopy />}
    </button>
  );
};
