interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`flex justify-center items-center h-64 ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-orange-500 ${sizeClasses[size]}`}
      />
    </div>
  );
};
