interface InfoBannerProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
}

export const InfoBanner = ({
  children,
  variant = 'info',
  className = '',
}: InfoBannerProps) => {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-orange-50 border-orange-200 text-orange-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div
      className={`mb-8 p-4 border rounded-lg ${variantClasses[variant]} ${className}`}
    >
      <p className="font-medium">{children}</p>
    </div>
  );
};
