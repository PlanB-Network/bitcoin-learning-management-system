import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { TbChevronRight } from 'react-icons/tb';

interface HorizontalCardProps {
  title: string;
  subtitle?: string;
  link: string;
  thumbnail: string;
  className?: string;
  hideMobileThumbnail?: boolean;
  hideThumbnailBorder?: boolean;
}

export const HorizontalCard = ({
  title,
  subtitle,
  link,
  thumbnail,
  className,
  hideMobileThumbnail,
  hideThumbnailBorder,
}: HorizontalCardProps) => {
  return (
    <Link
      to={link}
      className={cn(
        'w-full flex items-center justify-between p-2 hover:bg-neutral-50 rounded-2xl gap-4',
        className,
      )}
      target={'_blank'}
      rel={'noopener noreferrer'}
    >
      <div className="flex gap-6 items-center">
        <Image
          src={thumbnail}
          alt={title}
          breakpoints={{ default: 96, md: 160 }}
          loading="lazy"
          className={cn(
            'object-cover [overflow-clip-margin:unset] aspect-square rounded-lg md:rounded-2xl size-12 md:size-20',
            hideMobileThumbnail && 'max-md:hidden',
            hideThumbnailBorder
              ? 'border-0'
              : 'border-[0.5px] border-neutral-100',
          )}
        />
        <div className="flex flex-col gap-0.5">
          <span className="body-base-bold md:subtitle-base text-black">
            {title}
          </span>
          {subtitle && (
            <span className="body-base text-neutral-500 line-clamp-1">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <TbChevronRight className="text-neutral-300 shrink-0" size={20} />
    </Link>
  );
};
