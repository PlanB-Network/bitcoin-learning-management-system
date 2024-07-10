import { cn } from '@sovereign-university/ui';

interface BuilderCardProps {
  name: string;
  logo: string;
  cardWidth?: string;
}

export const BuilderCard = (props: BuilderCardProps) => {
  return (
    <div className="group/builder relative flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center justify-center">
        <img
          className={cn(
            'size-[50px] md:size-20 rounded-full group-hover/builder:blur-sm group-hover/builder:brightness-[0.30] group-focus/builder:blur-sm group-focus/builder:brightness-[0.30] transition-all',
            props.cardWidth ? props.cardWidth : '',
          )}
          src={props.logo}
          alt={props.name}
        ></img>
        <p className="absolute text-center text-xs md:text-sm font-bold text-white opacity-0 group-hover/builder:opacity-100 group-focus/builder:opacity-100 transition-all">
          {props.name}
        </p>
      </div>
      <span className="text-xs font-bold text-white mt-2 md:block hidden text-center">
        {props.name}
      </span>
    </div>
  );
};
