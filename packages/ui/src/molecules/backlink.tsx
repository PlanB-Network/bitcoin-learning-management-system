import { Link } from '@tanstack/react-router';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { cn } from '#src/lib/utils.ts';

interface BackLinkProps {
  to?: string;
  label?: string;
  className?: string;
  asPlainText?: boolean;
}

export const BackLink = ({
  to,
  label,
  className = 'flex items-center subtitle-large-med-20px md:display-large text-darkOrange-5 hover:text-white mb-[30px]',
  asPlainText = false,
}: BackLinkProps) => {
  return asPlainText ? (
    <span className={cn(className, 'cursor-pointer')}>
      <MdKeyboardArrowLeft className="size-[18px] md:size-12" />
      <span className="ml-1">{label}</span>
    </span>
  ) : (
    <Link to={to} className={className}>
      <MdKeyboardArrowLeft className="size-[18px] md:size-12" />
      <span className="ml-1">{label}</span>
    </Link>
  );
};
