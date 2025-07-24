interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState = ({
  title,
  description,
  className = '',
  children,
}: EmptyStateProps) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
      <h3 className="text-xl font-medium mb-2 text-gray-900">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {children}
    </div>
  );
};
