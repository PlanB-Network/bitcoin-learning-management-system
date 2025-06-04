import { Flag, cn } from '@blms/ui';

import { Image } from '#src/components/image.tsx';

interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author?: string;
  year?: number | null;
  language?: string;
  level?: string;
  className?: string;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div
      className={cn(
        'max-md:h-full md:relative group min-w-[288px] min-[622px]:max-w-[288px] md:min-w-[250px] md:max-w-[254px] flex md:flex-col gap-4 md:gap-8 px-2 py-1.5 md:p-0 hover:bg-darkOrange-10 hover:shadow-sm-card-dark border grow shrink-0 border-transparent hover:border-darkOrange-6 rounded-2xl transition-all overflow-hidden',
        props.className,
      )}
    >
      <Image
        breakpoints={{ default: 84, md: 256 }}
        width="256"
        height="256"
        className="aspect-square object-contain w-[84px] md:w-full md:group-hover:blur-[10px] md:group-hover:brightness-[0.2] transition-all"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
        loading="lazy"
      />
      <div className="md:absolute w-full flex md:justify-center md:items-center flex-col gap-[10px] md:gap-4 md:px-4 md:text-center md:size-full md:group-hover:bg-darkOrange-9/20 md:opacity-0 md:group-hover:opacity-100 transition-all">
        <span className="text-white leading-[160%] text-sm font-medium md:subtitle-large-med-20px line-clamp-3 md:line-clamp-2">
          {props.name}
        </span>
        <div className="flex justify-between flex-row items-center gap-1">
          {(props.author || props.year) && (
            <span className="text-white text-xs md:subtitle-medium-med-16px transition-all line-clamp-1 md:line-clamp-2">
              {props.author}
              {props.year && (
                <>
                  <span> · </span>
                  <span className="text-white/75 md:text-white font-light transition-all">
                    {props.year}
                  </span>
                </>
              )}
            </span>
          )}
          {props.language && (
            <Flag
              code={props.language}
              size="s"
              className="shrink-0 md:!hidden"
            />
          )}
        </div>

        <div className="flex md:flex-col gap-4 max-md:hidden">
          {props.level && (
            <p className="subtitle-medium-med-16px text-newGray-3">
              Level : {''}
              <span className="subtitle-medium-med-16px text-white capitalize">
                {props.level}
              </span>
            </p>
          )}
          {props.language && (
            <Flag
              code={props.language}
              size="l"
              className="md:!self-center shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};
