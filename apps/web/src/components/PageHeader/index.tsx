export const PageHeader = ({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) => {
  return (
    <div className="flex max-w-5xl flex-col gap-2 place-self-center px-8 py-4 text-white md:px-0">
      <h1 className="text-4xl font-semibold leading-[56px] sm:px-4 sm:text-7xl sm:font-medium sm:leading-[114px]">
        {title}
      </h1>

      <h1 className="pb-1 text-base font-semibold sm:px-4 sm:text-2xl">
        {subtitle}
      </h1>

      <h1 className="text-xs font-normal sm:px-4 sm:text-xl sm:leading-6">
        {description}
      </h1>
    </div>
  );
};
