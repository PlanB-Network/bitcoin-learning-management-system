import { cn } from '@blms/ui';
import type { IconType } from 'react-icons';

type NetworkCardProps = {
  text: string;
  subtext: string;
  icon: string | IconType;
  className?: string;
};

export default function NetworkCard({
  text,
  subtext,
  icon,
  className,
}: NetworkCardProps) {
  const Icon = icon;
  return (
    <div
      className={cn(
        'flex flex-col gap-2 lg:gap-4 w-full lg:w-[380px] border-[1px]',
        'border-orange-600 bg-[#00000088] rounded-3xl px-2.5 lg:px-4 py-4 md:p-8 text-left',
        className,
      )}
    >
      {typeof icon === 'string' ? (
        <img className="w-12 lg:ml-3" src={icon} alt="" loading="lazy" />
      ) : (
        <Icon className="size-12 text-orange-500" />
      )}

      <p className="display-extra-small lg:display-small">{text}</p>
      <p className="body-base lg:body-small lg:text-xl text-gray-300">
        {subtext}
      </p>
    </div>
  );
}
