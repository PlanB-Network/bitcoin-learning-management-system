import Flag from '#src/molecules/Flag/index.tsx';

interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author: string;
  year?: number | null;
  language?: string;
  level?: string;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div className="md:relative group min-w-[288px] sm:min-w-[400px] md:min-w-[250px] md:max-w-[254px] flex md:flex-col gap-4 md:gap-8 px-2 py-1.5 md:p-0 md:hover:bg-darkOrange-10 md:hover:shadow-sm-card border grow shrink-0 border-transparent md:hover:border-darkOrange-6 rounded-2xl transition-all overflow-hidden">
      <img
        className="aspect-square object-contain w-[84px] md:w-full md:group-hover:blur-[10px] md:group-hover:brightness-[0.2] transition-all"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
      />
      <div className="md:absolute w-full flex md:justify-center md:items-center flex-col gap-[10px] md:gap-4 md:px-4 md:text-center md:size-full md:group-hover:bg-darkOrange-9/20 md:opacity-0 md:group-hover:opacity-100 transition-all">
        <span className="text-white leading-[160%] text-sm font-medium md:subtitle-large-med-20px line-clamp-3 md:line-clamp-2">
          {props.name}
        </span>
        <div className="flex justify-between flex-row items-center gap-1">
          <span className="text-white max-md:group-hover:text-darkOrange-1 text-xs md:subtitle-med-16px transition-all line-clamp-1 md:line-clamp-2">
            {props.author}
            {props.year && (
              <>
                <span> · </span>
                <span className="text-white/75 md:text-white max-md:group-hover:text-darkOrange-1 font-light transition-all">
                  {props.year}
                </span>
              </>
            )}
          </span>
          {props.language && (
            <Flag
              code={props.language}
              size="s"
              className="md:self-center shrink-0 md:hidden"
            />
          )}
        </div>

        <div className="flex md:flex-col gap-4 max-md:hidden">
          {props.level && (
            <p className="subtitle-med-16px text-newGray-3">
              Level : {''}
              <span className="subtitle-med-16px text-white capitalize">
                {props.level}
              </span>
            </p>
          )}
          {props.language && (
            <Flag
              code={props.language}
              size="l"
              className="md:self-center shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};
