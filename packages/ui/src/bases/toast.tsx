import { cva } from 'class-variance-authority';
import type { MouseEventHandler } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import type { IconType } from 'react-icons/lib';
import { toast } from 'react-toastify';

export { ToastContainer } from 'react-toastify';

const toastVariants = cva('md:!w-[299px] focus:ring-1 focus:ring-newGray-2', {
  variants: {
    mode: {
      light: '',
      dark: 'dark',
    },
    color: {
      primary:
        '!bg-darkOrange-0 dark:!bg-darkOrange-10 hover:!bg-darkOrange-1 hover:dark:!bg-darkOrange-9 focus:!bg-darkOrange-1 focus:dark:!bg-darkOrange-9',
      warning:
        '!bg-red-1 dark:!bg-red-9 hover:!bg-red-2 hover:dark:!bg-red-8 focus:!bg-red-2 focus:dark:!bg-red-8',
      success:
        '!bg-brightGreen-1 dark:!bg-brightGreen-9 hover:!bg-brightGreen-2 hover:dark:!bg-brightGreen-8 focus:!bg-brightGreen-2 focus:dark:!bg-brightGreen-8',
      neutral:
        '!bg-newGray-6 dark:!bg-newBlack-3 hover:!bg-newGray-5 hover:dark:!bg-newBlack-4 focus:!bg-newGray-5 focus:dark:!bg-newBlack-4',
    },
  },
  defaultVariants: {
    mode: 'light',
    color: 'primary',
  },
});

const textVariants = cva('body-medium-12px', {
  variants: {
    mode: {
      light: '!text-newBlack-1',
      dark: '!text-white',
    },
  },
  defaultVariants: {
    mode: 'light',
  },
});

const iconVariants = cva('shrink-0', {
  variants: {
    mode: {
      light: '',
      dark: 'dark',
    },
    color: {
      primary: '!text-darkOrange-4 dark:!text-darkOrange-6',
      warning: '!text-red-5',
      success: '!text-brightGreen-4 dark:!text-brightGreen-6',
      neutral: '!text-newGray-3 dark:!text-newGray-2',
    },
  },
  defaultVariants: {
    mode: 'light',
    color: 'primary',
  },
});

const progressBarVariants = cva('', {
  variants: {
    mode: {
      light: '',
      dark: 'dark',
    },
    color: {
      primary: '!bg-darkOrange-4 dark:!bg-darkOrange-6',
      warning: '!bg-red-5',
      success: '!bg-brightGreen-4 dark:!bg-brightGreen-6',
      neutral: '!bg-newGray-3 dark:!bg-newGray-2',
    },
  },
  defaultVariants: {
    mode: 'light',
    color: 'primary',
  },
});

const toastCloseButtonVariants = cva('shrink-0', {
  variants: {
    mode: {
      light: 'hover:!brightness-90',
      dark: 'dark hover:!brightness-110',
    },
    color: {
      primary: '!text-darkOrange-4 dark:!text-darkOrange-6',
      warning: '!text-red-5',
      success: '!text-brightGreen-4 dark:!text-brightGreen-6',
      neutral: '!text-newGray-3 dark:!text-newGray-2',
    },
  },
  defaultVariants: {
    mode: 'light',
    color: 'primary',
  },
});

interface ToastProps {
  mode?: 'light' | 'dark';
  color?: 'primary' | 'warning' | 'success' | 'neutral';
}

export const customToast = (
  message: string,
  options: {
    mode?: ToastProps['mode'];
    color?: ToastProps['color'];
    icon?: IconType;
    imgSrc?: string;
    closeButton?: boolean;
    closeOnClick?: boolean;
    onClick?: () => void;
    time?: number;
  },
) => {
  const { closeOnClick = true } = options;

  return toast(
    ToastContent({
      message: message,
      className: textVariants({
        mode: options.mode,
      }),
      onClick: options.onClick,
    }),
    {
      autoClose: options.time || 5000,
      className: toastVariants({
        mode: options.mode,
        color: options.color,
      }),
      progressClassName: progressBarVariants({
        mode: options.mode,
        color: options.color,
      }),
      icon: options.imgSrc
        ? () => (
            <img
              src={options.imgSrc}
              alt={message}
              className="shrink-0 size-8"
            />
          )
        : options.icon && (
            <ToastIconWithClasses
              icon={options.icon}
              mode={options.mode}
              color={options.color}
            />
          ),
      closeButton: options.onClick
        ? false
        : options.closeButton
          ? ({
              closeToast,
            }: {
              closeToast: MouseEventHandler<HTMLButtonElement>;
            }) => (
              <ToastCloseButton
                closeToast={closeToast}
                mode={options.mode}
                color={options.color}
              />
            )
          : false,
      onClick: options.onClick,
      closeOnClick: closeOnClick,
    },
  );
};

const ToastContent = ({
  message,
  className,
  onClick,
}: {
  message: string;
  className: string;
  onClick?: () => void;
}) => (
  <span
    className={className}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {message}
  </span>
);

const ToastCloseButton = ({
  closeToast,
  mode,
  color,
}: {
  closeToast: MouseEventHandler<HTMLButtonElement>;
  mode?: ToastProps['mode'];
  color?: ToastProps['color'];
}) => (
  <button
    type="button"
    onClick={closeToast}
    className="shrink-0 self-start ml-auto"
    aria-label="Close toast"
    tabIndex={0}
  >
    <IoCloseOutline
      size={24}
      className={toastCloseButtonVariants({ mode, color })}
    />
  </button>
);

const ToastIconWithClasses = ({
  icon: Icon,
  mode,
  color,
}: {
  icon: IconType;
  mode?: ToastProps['mode'];
  color?: ToastProps['color'];
}) => {
  return <Icon size={28} className={iconVariants({ mode, color })} />;
};
