interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author: string;
  year?: number | null;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div className="flex md:flex-col gap-4 p-3  group-hover:bg-darkOrange-10 group-hover:shadow-[0px_0px_10px_0px_#FF5C00] group-focus:bg-darkOrange-10 group-focus:shadow-[0px_0px_10px_0px_#FF5C00] border border-transparent group-hover:border-darkOrange-6 group-focus:border-darkOrange-6 rounded-2xl md:group-hover:z-10 md:group-hover:scale-110 md:group-focus:z-10 md:group-focus:scale-110 transition-all duration-300">
      <img
        className="aspect-square object-contain w-[84px] md:w-full md:group-hover:rounded-2xl transition-all duration-300"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
      />
      <div className="flex flex-col gap-[10px] md:gap-4 ">
        <span className="text-white text-sm md:text-xl md:leading-5 font-medium">
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
