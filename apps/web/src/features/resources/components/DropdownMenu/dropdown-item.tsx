import { Link } from '@tanstack/react-router';

interface DropdownItemProps {
  name: string;
  link?: string;
  onClick?: () => void;
}

export const DropdownItem = ({ name, link, onClick }: DropdownItemProps) => {
  return link ? (
    <Link to={link} className="flex items-center gap-4 p-2 hover:bg-white/15">
      <span className="text-white leading-[140%] tracking-[0.15px]">
        {name}
      </span>
    </Link>
  ) : (
    <button
      className="text-left p-2 text-white leading-[140%] tracking-[0.15px] hover:bg-white/15 rounded-2xl w-full"
      onClick={onClick}
    >
      {name}
    </button>
  );
};
