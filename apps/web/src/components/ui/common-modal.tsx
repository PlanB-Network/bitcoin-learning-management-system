import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  isSuccess?: boolean;
  errorMessage?: string;
  maxWidth?: string;
}

export const CommonModal: React.FC<CommonModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  actions,
  isSuccess = false,
  errorMessage,
  maxWidth = 'max-w-md',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full p-6 relative`}
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>

        {/* Logo and content */}
        <div className="flex flex-col items-center">
          <img src={PlanBLogoBlack} alt="Plan B Network" className="h-8 mb-6" />

          <h2 className="text-orange-500 text-lg font-medium mb-6 text-center">
            {title}
          </h2>

          {icon && <div className="text-orange-500 text-4xl mb-6">{icon}</div>}

          {/* Error message */}
          {errorMessage && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Content */}
          {children}

          {/* Actions */}
          {actions && <div className="flex space-x-3 mt-6">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
