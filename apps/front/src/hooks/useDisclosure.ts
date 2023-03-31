import { useState } from 'react';

export const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    close: () => setIsOpen(false),
    open: () => setIsOpen(true),
    toggle: () => setIsOpen((prev) => !prev),
  };
};
