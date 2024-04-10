import { Link } from '@tanstack/react-router';

export const PageHeader = ({
  title,
  subtitle,
  description,
  link,
}: {
  title: string;
  subtitle?: string;
  description: string;
  link?: string;
}) => {
  return (
    <div className="max-w-[880px] max-lg:px-4 flex flex-col mx-auto">
      {subtitle && (
        <h1 className="text-center text-sm md:text-2xl text-newOrange-1 font-medium md:font-semibold md:leading-[1.6] md:tracking-[0.15px] mb-2.5 md:mb-4">
          {subtitle}
        </h1>
      )}

      {link ? (
        // TODO fix
        <Link to={link as '/'}>
          <PageTitle title={title} />
        </Link>
      ) : (
        <PageTitle title={title} />
      )}

      <p className="text-center text-xs md:text-base text-newGray-1 leading-[1.66] md:leading-[1.75] tracking-[0.4px] md:tracking-[0.15px]">
        {description}
      </p>
    </div>
  );
};

const PageTitle = ({ title }: { title: string }) => {
  return (
    <h2 className="text-center text-2xl md:text-6xl text-white md:font-light leading-none md:leading-[1.2] tracking-[-0.5px] mb-5 md:mb-6">
      {title}
    </h2>
  );
};
