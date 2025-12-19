import { cva } from 'class-variance-authority';
import type { MouseEventHandler } from 'react';
import type { IconType } from 'react-icons/lib';
import { TbX } from 'react-icons/tb';
import { toast } from 'react-toastify';

export { ToastContainer } from 'react-toastify';

const toastVariants = cva('md:!w-[299px] focus:ring-1 focus:ring-neutral-400', {
  defaultVariants: {
    color: 'primary',
    mode: 'light',
  },
  variants: {
    color: {
      neutral:
        '!bg-neutral-50 dark:!bg-neutral-800 hover:!bg-neutral-100 hover:dark:!bg-neutral-700 focus:!bg-neutral-100 focus:dark:!bg-neutral-700',
      primary:
        '!bg-orange-50 dark:!bg-orange-950 hover:!bg-orange-100 hover:dark:!bg-orange-900 focus:!bg-orange-100 focus:dark:!bg-orange-900',
      success:
        '!bg-green-50 dark:!bg-green-800 hover:!bg-green-100 hover:dark:!bg-green-700 focus:!bg-green-100 focus:dark:!bg-green-700',
      warning:
        '!bg-red-50 dark:!bg-red-800 hover:!bg-red-100 hover:dark:!bg-red-700 focus:!bg-red-100 focus:dark:!bg-red-700',
    },
    mode: {
      dark: 'dark',
      light: '',
    },
  },
});

const textVariants = cva('body-medium-12px', {
  defaultVariants: {
    mode: 'light',
  },
  variants: {
    mode: {
      dark: '!text-white',
      light: '!text-neutral-1000',
    },
  },
});

const iconVariants = cva('shrink-0', {
  defaultVariants: {
    color: 'primary',
    mode: 'light',
  },
  variants: {
    color: {
      neutral: '!text-neutral-300 dark:!text-neutral-400',
      primary: '!text-orange-400 dark:!text-orange-600',
      success: '!text-green-300 dark:!text-green-500',
      warning: '!text-red-400',
    },
    mode: {
      dark: 'dark',
      light: '',
    },
  },
});

const progressBarVariants = cva('', {
  defaultVariants: {
    color: 'primary',
    mode: 'light',
  },
  variants: {
    color: {
      neutral: '!bg-neutral-300 dark:!bg-neutral-400',
      primary: '!bg-orange-400 dark:!bg-orange-600',
      success: '!bg-green-300 dark:!bg-green-500',
      warning: '!bg-red-400',
    },
    mode: {
      dark: 'dark',
      light: '',
    },
  },
});

const toastCloseButtonVariants = cva('shrink-0', {
  defaultVariants: {
    color: 'primary',
    mode: 'light',
  },
  variants: {
    color: {
      neutral: '!text-neutral-300 dark:!text-neutral-400',
      primary: '!text-orange-400 dark:!text-orange-600',
      success: '!text-green-300 dark:!text-green-500',
      warning: '!text-red-400',
    },
    mode: {
      dark: 'dark hover:!brightness-110',
      light: 'hover:!brightness-90',
    },
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
      className: textVariants({
        mode: options.mode,
      }),
      message: message,
      onClick: options.onClick,
    }),
    {
      autoClose: options.time || 5000,
      className: toastVariants({
        color: options.color,
        mode: options.mode,
      }),
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
      closeOnClick: closeOnClick,
      draggablePercent: 30,
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
      onClick: options.onClick,
      progressClassName: progressBarVariants({
        color: options.color,
        mode: options.mode,
      }),
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
    <TbX size={24} className={toastCloseButtonVariants({ color, mode })} />
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
  return <Icon size={28} className={iconVariants({ color, mode })} />;
};
