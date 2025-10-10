import { Link } from '@tanstack/react-router';
import type { IconType } from 'react-icons/lib';
import { cn } from '#src/lib/utils.ts';
import { Button } from './button.tsx';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconType;
  actionButton?: { onClick: () => void; label: string };
  linkButton?: { href: string; label: string };
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionButton,
  linkButton,
  className = '',
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'border border-neutral-100 rounded-[20px] px-8 py-12 flex flex-col justify-center items-center text-center w-full',
        className,
      )}
    >
      {Icon && <Icon size={24} className="text-neutral-200 mb-4" />}
      <span className="label-strong text-black">{title}</span>
      {description && (
        <span className="body-large text-black">{description}</span>
      )}
      {actionButton && (
        <Button
          variant="primary"
          onClick={actionButton.onClick}
          className="mt-8"
        >
          {actionButton.label}
        </Button>
      )}
      {linkButton && (
        <Button variant="primary" asChild className="mt-8">
          <Link to={linkButton.href}>{linkButton.label}</Link>
        </Button>
      )}
    </div>
  );
};
