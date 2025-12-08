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
      {link ? (
        <Link to={link}>
          <PageTitle title={title} />
        </Link>
      ) : (
        <PageTitle title={title} />
      )}
      {subtitle && (
        <h1 className="body-large text-neutral-500 max-md:hidden">
          {subtitle}
        </h1>
      )}
      <div className="h-0 mb-2 md:mb-6" />
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
    <h2 className={cn('display-base md:display-large text-black')}>{title}</h2>
  );
};
