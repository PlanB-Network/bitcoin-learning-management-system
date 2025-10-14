import { cn } from '@blms/ui';

type NetworkCardProps = {
  text: string;
  subtext: string;
  img: string;
  className?: string;
};

export default function NetworkCard({
  text,
  subtext,
  img,
  className,
}: NetworkCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 lg:gap-4 w-44 md:w-52 lg:w-[380px] border-[1px] border-orange-600 rounded-3xl p-4 md:p-8 text-left',
        className,
      )}
    >
      <img className="w-12 ml-3" src={img} alt="" />
      <p className="uppercase body-small-bold lg:display-small">{text}</p>
      <p className="body-small lg:text-xl text-gray-300">{subtext}</p>
    </div>
  );
}
