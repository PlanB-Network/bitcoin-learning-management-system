import { BsGithub, BsLinkedin, BsTwitterX, BsYoutube } from 'react-icons/bs';
import { SiRumble } from 'react-icons/si';
import Nostr from '#src/assets/icons/nostr.svg?react';

import { cn } from '@blms/ui';

interface SocialNetworksProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const SocialNetworks = ({
  variant = 'light',
  className = '',
}: SocialNetworksProps) => {
  const iconSize = 18;

  const iconClasses = cn(
    'transition-colors hover:text-orange-500',
    variant === 'light' ? 'text-white' : 'text-black',
  );

  return (
    <div
      className={cn(
        'flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 md:gap-4',
        className,
      )}
    >
      <a
        href="https://twitter.com/planb_network"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow us on Twitter"
      >
        <BsTwitterX size={iconSize} className={iconClasses} />
      </a>
      <a
        href="https://nostr.net/@planb_network"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow us on Nostr"
      >
        <Nostr
          width={iconSize}
          height={iconSize}
          className={cn(iconClasses, 'fill-current')}
        />
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
        href="https://www.linkedin.com/company/plan-b-network/"
        target="_blank"
        rel="noreferrer"
        aria-label="Follow us on LinkedIn"
      >
        <BsLinkedin size={iconSize} className={iconClasses} />
      </a>
      <a
        href="https://www.youtube.com/@PlanBNetwork"
        target="_blank"
        rel="noreferrer"
        aria-label="Subscribe to our YouTube channel"
      >
        <BsYoutube size={iconSize} className={iconClasses} />
      </a>
      <a
        href="https://rumble.com/c/PlanBNetwork"
        target="_blank"
        rel="noreferrer"
        aria-label="Watch us on Rumble"
      >
        <SiRumble size={iconSize} className={iconClasses} />
      </a>
    </div>
  );
};
