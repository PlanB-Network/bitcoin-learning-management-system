import { BsGithub, BsTwitterX, BsYoutube } from 'react-icons/bs';

import { cn } from '@blms/ui';
import { useGreater } from '#src/hooks/use-greater.ts';

interface SocialNetworksProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const SocialNetworks = ({
  variant = 'light',
  className = '',
}: SocialNetworksProps) => {
  const isScreenLg = useGreater('lg');
  const iconSize = isScreenLg ? 24 : 18;

  const iconClasses = cn('', variant === 'light' ? 'text-white' : 'text-black');

  return (
    <div className={`flex gap-5 ${className}`}>
      <a
        href="https://twitter.com/planb_network"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow us on Twitter"
      >
        <BsTwitterX size={iconSize} className={iconClasses} />
      </a>
      <a
        href="https://github.com/PlanB-Network/bitcoin-educational-content"
        target="_blank"
        rel="noreferrer"
        aria-label="View our GitHub repository"
      >
        <BsGithub size={iconSize} className={iconClasses} />
      </a>
      <a
        href="https://www.youtube.com/@PlanBNetwork"
        target="_blank"
        rel="noreferrer"
        aria-label="Subscribe to our YouTube channel"
      >
        <BsYoutube size={iconSize} className={iconClasses} />
      </a>
    </div>
  );
};
