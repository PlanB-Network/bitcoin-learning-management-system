import { cn } from '@sovereign-university/ui';

interface BuilderCardProps {
  name: string;
  logo: string;
  cardWidth?: string;
}

export const BuilderCard = (props: BuilderCardProps) => {
  return (
    <div className="group/builder relative flex flex-col items-center justify-center">
      <img
        className={cn(
          'w-[50px] md:w-20 rounded-full group-hover/builder:blur-sm group-hover/builder:brightness-[0.30] group-focus/builder:blur-sm group-focus/builder:brightness-[0.30] transition-all',
          props.cardWidth ? props.cardWidth : 'w-[50px] md:w-20',
        )}
        src={props.logo}
        alt={props.name}
      />
      <p className="absolute text-center text-xs md:text-sm font-bold text-white opacity-0 group-hover/builder:opacity-100 group-focus/builder:opacity-100 transition-all">
        {props.name}
      </p>
    </div>
  );
};
