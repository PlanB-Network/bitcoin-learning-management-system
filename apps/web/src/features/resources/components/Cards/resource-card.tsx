interface ResourceCardProps {
  imageSrc?: string | null;
  name: string;
  author: string;
  year?: number | null;
}

export const ResourceCard = (props: ResourceCardProps) => {
  return (
    <div className="group flex md:flex-col gap-4 p-3 bg-newBlack-2 md:bg-transparent hover:bg-newBlack-3 md:hover:bg-newOrange-1 max-md:hover:shadow-[0px_1px_1px_0px_rgba(255,92,0,0.67)]  rounded-2xl md:hover:z-10 md:hover:scale-110 md:transition-all md:duration-300">
      <img
        className="aspect-square object-contain w-[84px] md:w-full md:group-hover:rounded-2xl transition-all duration-300"
        src={props.imageSrc ? props.imageSrc : ''}
        alt={props.name}
      />
      <div className="flex flex-col gap-[10px] md:gap-4 ">
        <span className="text-white max-md:group-hover:text-newOrange-1 text-sm md:text-xl md:leading-5 font-medium">
          {props.name}
        </span>
        <span className="text-white max-md:group-hover:text-newOrange-1 text-xs md:text-base md:leading-6">
          {props.author}
          {props.year && (
            <>
              <span> · </span>
              <span className="text-white/75 max-md:group-hover:text-newOrange-1 font-light">
                {props.year}
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
