import { cn } from '@blms/ui';
import type { IconType } from 'react-icons';

type NetworkCard2Props = {
  text: string;
  subtext: string;
  icon: string | IconType;
  className?: string;
};

export default function NetworkCard2({
  text,
  subtext,
  icon,
  className,
}: NetworkCard2Props) {
  const Icon = icon;
  return (
    <div
      className={cn(
        'flex flex-col gap-2 lg:gap-4 w-40 md:w-52 lg:w-[380px] border-[1px]',
        'border-orange-600 bg-[#00000088] rounded-3xl p-4 md:p-8 text-left',
        className,
      )}
    >
      {typeof icon === 'string' ? (
        <img className="w-12 ml-3" src={icon} alt="" />
      ) : (
        <Icon className="size-12 text-orange-500" />
      )}

      <p className="uppercase body-small-bold lg:display-small">{text}</p>
      <p className="body-small lg:text-xl text-gray-300">{subtext}</p>
    </div>
  );
}
