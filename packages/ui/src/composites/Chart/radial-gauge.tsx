import { type VariantProps, cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const gaugeVariantStyles = {
  green: {
    background: 'stroke-green-200', // Unfilled portion
    foreground: 'stroke-green-500', // Filled portion
    text: 'text-green-600',
  },
};

type GaugeVariant = keyof typeof gaugeVariantStyles;

const gaugeContainerVariants = cva(
  'relative inline-flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm p-4',
  {
    variants: {},
    defaultVariants: {},
  },
);

export interface RadialGaugeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gaugeContainerVariants> {
  percentage: number;
  label: string;
  variant?: GaugeVariant;
  size?: number;
}

const RadialGauge = ({
  className,
  percentage,
  label,
  variant = 'green',
  size = 124,
  ...props
}: RadialGaugeProps) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const radius = 45;
  const strokeWidth = 10;

  const circumference = radius * Math.PI;

  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;

  const colorClasses = gaugeVariantStyles[variant];

  return (
    <div
      className={clsx(gaugeContainerVariants(), className)}
      style={{ width: size, height: size * 0.85 }}
      {...props}
    >
      <div className="relative w-full h-full">
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          viewBox="0 0 100 50"
          className="w-full h-auto absolute top-0 left-0"
        >
          {/* Unfilled */}
          <path
            d={`M 5,50 A ${radius},${radius} 0 0 1 95,50`}
            fill="none"
            strokeWidth={strokeWidth}
            className={clsx(
              'transition-all duration-500',
              colorClasses.background,
            )}
          />

          {/* Filled */}
          <path
            d={`M 5,50 A ${radius},${radius} 0 0 1 95,50`}
            fill="none"
            strokeWidth={strokeWidth}
            className={clsx(
              'transition-all duration-1000 ease-out',
              colorClasses.foreground,
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>

        {/* Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className={clsx(
              'font-bold text-5xl tracking-tight',
              colorClasses.text,
            )}
            style={{ fontSize: size / 4.5 }} // Responsive font size - change
          >
            {Math.round(clampedPercentage)}%
          </span>
          <span
            className={clsx('font-medium text-lg', colorClasses.text)}
            style={{ fontSize: size / 12 }} // Responsive font size - change
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export { RadialGauge };
