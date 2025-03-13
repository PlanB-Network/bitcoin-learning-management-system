import { cn } from '@blms/ui';
import { Image } from '#src/components/image.tsx';

interface ProjectCardProps {
  name: string;
  logo: string;
  cardWidth?: string;
}

export const ProjectCard = (props: ProjectCardProps) => {
  return (
    <div className="group/project relative flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center justify-center">
        <Image
          breakpoints={{ default: 50, md: 80 }}
          className={cn(
            'size-[50px] md:size-20 rounded-full group-hover/project:blur-sm group-hover/project:brightness-[0.30] group-focus/project:blur-sm group-focus/project:brightness-[0.30] transition-all',
            props.cardWidth ? props.cardWidth : '',
          )}
          src={props.logo}
          alt={props.name}
        />
        <p className="absolute text-center text-xs md:text-sm font-bold text-white opacity-0 group-hover/project:opacity-100 group-focus/project:opacity-100 transition-all">
          {props.name}
        </p>
      </div>
      <span className="text-xs font-bold text-white mt-2 md:block hidden text-center">
        {props.name}
      </span>
    </div>
  );
};
