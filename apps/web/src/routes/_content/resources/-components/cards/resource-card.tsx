interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author: string;
  year?: number | null;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div className="md:relative group md:max-w-64 flex md:flex-col gap-4 md:gap-8 p-3 md:p-0 max-md:hover:bg-darkOrange-10 hover:shadow-sm-card border grow border-transparent hover:border-darkOrange-6 rounded-2xl transition-all overflow-hidden">
      <img
        className="aspect-square object-contain w-[84px] md:w-full md:group-hover:blur-[10px] md:group-hover:brightness-[0.2] transition-all"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
      />
      <div className="md:absolute flex md:justify-center md:items-center flex-col gap-[10px] md:gap-3 md:px-4 md:text-center md:size-full md:group-hover:bg-darkOrange-9/20 md:opacity-0 md:group-hover:opacity-100 transition-all">
        <span className="text-white  text-sm md:text-xl md:leading-6 font-medium md:font-semibold">
          {props.name}
        </span>
        <span className="text-white max-md:group-hover:text-darkOrange-1 text-xs md:text-base md:leading-6 transition-all">
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
      </div>
    </div>
  );
};
