import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';

export const PageHeader = ({
  title,
  subtitle,
  description = '',
  link,
  hideOnMobile,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  hideOnMobile?: boolean;
}) => {
  return (
    <div
      className={cn('flex flex-col', hideOnMobile && 'max-md:hidden', 'px-0')}
    >
      {subtitle && (
        <h1 className="title-base text-black max-md:mb-2 mb-1">{subtitle}</h1>
      )}
      {link ? (
        <Link to={link}>
          <PageTitle title={title} />
        </Link>
      ) : (
        <PageTitle title={title} />
      )}
      {description && (
        <p className={cn('body-small md:body-large text-neutral-600')}>
          {description}
        </p>
      )}
    </div>
  );
};

export const PageTitle = ({ title }: { title: string }) => {
  return (
    <h2 className={cn('display-base md:display-large text-black mb-2 md:mb-6')}>
      {title}
    </h2>
  );
};
