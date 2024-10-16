import type React from 'react';
import { useEffect } from 'react';
import { FaRegCopy, FaTelegram, FaTimes, FaWhatsapp } from 'react-icons/fa';
import { TbBrandX } from 'react-icons/tb';

interface ShareModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, url, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => null)
      .catch(() => alert('Error al copiar la URL'));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center size-full bg-black/30 backdrop-blur-sm overflow-hidden">
      <div className="relative bg-black rounded-lg p-6 w-80 shadow-lg max-h-screen">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>

        <span className="text-sm text-orange-500 mb-4">
          Copy the link to share:
        </span>

        <div className="flex items-center border rounded p-2 mb-4">
          <input
            type="text"
            value={url}
            readOnly
            className="grow text-gray-200 bg-black border-none outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="ml-2 p-2 text-gray-200 hover:text-orange-600"
          >
            <FaRegCopy />
          </button>
        </div>

        <div className="flex justify-center gap-x-4 mb-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-orange-500 text-orange-500 p-2 rounded-full hover:bg-black-500 hover:text-white"
          >
            <FaWhatsapp size={24} />
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-orange-500 text-orange-500 p-2 rounded-full hover:bg-black-500 hover:text-white"
          >
            <FaTelegram size={24} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-orange-500 text-orange-500 p-2 rounded-full hover:bg-black-400 hover:text-white"
          >
            <TbBrandX size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
