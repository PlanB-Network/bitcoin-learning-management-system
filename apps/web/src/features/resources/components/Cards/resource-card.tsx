interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author: string;
  year?: number | null;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div className="group flex md:flex-col gap-4 p-3 bg-newBlack-2 md:bg-transparent md:hover:bg-newOrange-1 rounded-2xl md:hover:z-10 md:hover:scale-110 md:transition-all md:duration-300">
      <img
        className="aspect-square object-contain w-[84px] md:w-full group-hover:rounded-2xl transition-all duration-300"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
      />
      <div className="flex flex-col gap-[10px] md:gap-4">
        <span className="text-white text-sm md:text-xl md:leading-5 font-medium">
          {props.name}
        </span>
        <span className="text-white text-xs md:text-base md:leading-6">
          {props.author}
          {props.year && (
            <>
              <span> · </span>
              <span className="text-white/75 font-light">{props.year}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
