import { cn, Flag, Image } from '@blms/ui';
import { TbChevronRight } from 'react-icons/tb';

interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author?: string;
  year?: number | null;
  language?: string;
  className?: string;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div
      className={cn(
        'max-sm:h-full sm:relative group w-full sm:min-w-[228px] sm:max-w-[228px] flex sm:flex-col max-sm:gap-3 p-2 sm:p-0 border-2 border-transparent sm:hover:border-orange-500 grow shrink-0 max-sm:hover:bg-neutral-50 rounded-2xl overflow-hidden items-center',
        props.className,
      )}
    >
      <Image
        breakpoints={{ default: 84, sm: 256 }}
        width="256"
        height="256"
        className="aspect-square object-contain w-14 sm:w-full"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
        loading="lazy"
      />
      <div className="text-black sm:absolute w-full flex sm:justify-center sm:items-center flex-col sm:gap-4 sm:px-3 sm:text-center sm:size-full sm:group-hover:bg-white/90 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:backdrop-blur-[2px]">
        <span className="body-base-bold line-clamp-3 sm:line-clamp-2">
          {props.name}
        </span>
        <div className="flex justify-between flex-row items-center gap-2">
          {(props.author || props.year) && (
            <span className="body-small line-clamp-1 sm:line-clamp-2">
              {props.author}
              {props.year && (
                <>
                  <span> · </span>
                  <span>{props.year}</span>
                </>
              )}
            </span>
          )}
        </div>

        <div className="flex sm:flex-col gap-4 max-sm:hidden">
          {props.language && (
            <Flag
              code={props.language}
              size="l"
              className="sm:!self-center shrink-0"
            />
          )}
        </div>
      </div>
      <TbChevronRight
        className="text-neutral-300 sm:hidden shrink-0"
        size={20}
      />
    </div>
  );
};
