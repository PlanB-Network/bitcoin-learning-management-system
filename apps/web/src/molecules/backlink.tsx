import { Link } from '@tanstack/react-router';
import { MdKeyboardArrowLeft } from 'react-icons/md';

interface BackLinkProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export const BackLink = ({
  to,
  label,
  className = 'flex items-center subtitle-large-med-20px md:display-large text-darkOrange-5 hover:text-white mb-[30px]',
  onClick,
}: BackLinkProps) => {
  return (
    <Link to={to} className={className} onClick={onClick}>
      <MdKeyboardArrowLeft className="size-[18px] md:size-12" />
      <span className="ml-1">{label}</span>
    </Link>
  );
};
