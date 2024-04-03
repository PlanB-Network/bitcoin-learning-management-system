interface BuilderCardProps {
  name: string;
  logo: string;
}

export const BuilderCard = (props: BuilderCardProps) => {
  return (
    <div className="relative group/builder flex flex-col items-center justify-center">
      <img
        className="w-[50px] md:w-20 rounded-full group-hover/builder:blur-sm group-hover/builder:brightness-[0.30] transition-all"
        src={props.logo}
        alt={props.name}
      />
      <p className="absolute text-center text-xs md:text-sm font-bold text-white opacity-0 group-hover/builder:opacity-100 transition-all">
        {props.name}
      </p>
    </div>
  );
};
