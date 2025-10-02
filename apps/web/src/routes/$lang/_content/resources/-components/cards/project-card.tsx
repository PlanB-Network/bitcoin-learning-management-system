import { cn, Image } from '@blms/ui';

interface ProjectCardProps {
  name: string;
  logo: string;
  cardWidth?: string;
}

export const ProjectCard = (props: ProjectCardProps) => {
  return (
    <div className="flex md:flex-col items-center md:justify-center gap-2 w-full md:w-29.5">
      <Image
        breakpoints={{ default: 40, md: 72 }}
        className={cn(
          'size-10 md:size-18 rounded-lg',
          props.cardWidth ? props.cardWidth : '',
        )}
        src={props.logo}
        alt={props.name}
      />
      <span className="text-black md:text-center max-md:line-clamp-2 line-clamp-3">
        {props.name}
      </span>
    </div>
  );
};
