interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author: string;
  year?: number | null;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div className="group w-[288px] md:max-w-64 flex md:flex-col gap-4 md:gap-8 p-3 hover:bg-darkOrange-10 hover:shadow-sm-card focus:bg-darkOrange-10 focus:shadow-sm-card border border-transparent hover:border-darkOrange-6 focus:border-darkOrange-6 rounded-2xl md:hover:z-10 md:hover:scale-110 md:focus:z-10 md:focus:scale-110 transition-all duration-300">
      <img
        className="aspect-square object-contain w-[84px] md:w-full md:group-hover:rounded-2xl transition-all duration-300"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
      />
      <div className="flex flex-col gap-[10px] md:gap-3 text-center">
        <span className="text-white text-sm md:text-xl md:leading-6 font-medium">
          {props.name}
        </span>
        <span className="text-white group-hover:text-darkOrange-1 group-focus:text-darkOrange-1 text-xs md:text-base md:leading-6 transition-all">
          {props.author}
          {props.year && (
            <>
              <span> · </span>
              <span className="text-white/75 group-hover:text-darkOrange-1 group-focus:text-darkOrange-1 font-light transition-all">
                {props.year}
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
