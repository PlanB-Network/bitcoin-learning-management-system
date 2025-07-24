import { Link } from '@tanstack/react-router';

interface BreadcrumbProps {
  to: string;
  params?: Record<string, string>;
  children: React.ReactNode;
  className?: string;
}

export const Breadcrumb = ({
  to,
  params,
  children,
  className = '',
}: BreadcrumbProps) => {
  return (
    <div className={`flex items-center mb-4 ${className}`}>
      <Link
        to={to}
        params={params}
        className="text-orange-600 hover:text-orange-700 flex items-center"
      >
        <span className="mr-1">‹</span> {children}
      </Link>
    </div>
  );
};
