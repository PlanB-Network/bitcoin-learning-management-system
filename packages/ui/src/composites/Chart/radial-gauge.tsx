import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '#src/lib/utils.ts';

import DurationClock from '#src/assets/charts/duration.svg';

const gaugeVariantStyles = {
  green: {
    background: 'stroke-brightGreen-2', // Unfilled
    foreground: 'stroke-brightGreen-4', // Filled
    text: 'text-brightGreen-6',
    needle: 'stroke-brightGreen-7',
  },
  purple: {
    background: 'stroke-[#EFB6FC]', // Unfilled
    foreground: 'stroke-[#D954F7]', // Filled
    text: 'text-[#D954F7]',
    needle: 'stroke-[#790792]',
  },
  yellow: {
    background: 'stroke-yellow-1', // Unfilled
    foreground: 'stroke-yellow-1', // Filled - See later if we want a different color than unfilled
    text: 'text-yellow-5',
    needle: 'stroke-yellow-7',
  },
  orange: {
    background: 'stroke-darkOrange-1', // Unfilled
    foreground: 'stroke-darkOrange-4', // Filled
    text: 'text-darkOrange-4',
    needle: 'text-darkOrange-4',
  },
};

const clockVariantStyles = {
  blue: {
    text: 'text-[#0A69DA]',
  },
};

type GaugeVariant = keyof typeof gaugeVariantStyles;
type DashGaugeVariant = keyof typeof gaugeVariantStyles;
type ClockVariant = keyof typeof clockVariantStyles;

const gaugeContainerVariants = cva(
  'max-lg:flex max-lg:items-center max-lg:justify-between relative inline-flex lg:flex-col items-center justify-center rounded-2xl',
  {
    variants: {
      size: {
        m: 'h-20 w-66 lg:w-40 lg:h-36 px-3 pb-3 pt-2.5',
        l: 'w-full max-w-54 lg:max-w-[336px] h-50 lg:px-14 my-7',
      },
    },
    defaultVariants: {
      size: 'm',
    },
  },
);

export interface RadialGaugeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gaugeContainerVariants> {
  percentage: number;
  label: string;
  variant?: GaugeVariant;
  size?: 'm' | 'l';
  showBackground?: boolean;
}

export interface DashGaugeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gaugeContainerVariants> {
  completed: number;
  total: number;
  label: string;
  variant?: DashGaugeVariant;
  size?: 'm' | 'l';
  showBackground?: boolean;
}

export interface ClockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gaugeContainerVariants> {
  time: string;
  label: string;
  variant?: ClockVariant;
  showBackground?: boolean;
}

const RadialGauge = ({
  className,
  percentage,
  label,
  variant = 'green',
  size = 'm',
  showBackground = false,
  ...props
}: RadialGaugeProps) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const radius = 45;
  const strokeWidth = 10;

  const circumference = radius * Math.PI;

  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;

  const needleAngle = (clampedPercentage / 100) * 180;
  const needleRadians = (needleAngle * Math.PI) / 180;

  const centerX = 50;
  const centerY = 50;

  const innerRadius = radius - strokeWidth / 2 - 1;
  const outerRadius = radius + strokeWidth / 2 + 1;

  const needleStartX = centerX - innerRadius * Math.cos(needleRadians);
  const needleStartY = centerY - innerRadius * Math.sin(needleRadians);
  const needleEndX = centerX - outerRadius * Math.cos(needleRadians);
  const needleEndY = centerY - outerRadius * Math.sin(needleRadians);

  const colorClasses = gaugeVariantStyles[variant];

  return (
    <div
      className={cn(
        showBackground && 'bg-white',
        gaugeContainerVariants({ size }),
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'subtitle-small-sb-14px lg:hidden',
          size === 'l' && 'hidden',
          colorClasses.text,
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          'relative h-full',
          size === 'l' ? 'w-full max-lg:h-40' : 'max-lg:w-26 lg:w-full',
        )}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          viewBox="0 0 100 55"
          className="w-full h-auto absolute top-0 left-0"
        >
          {/* Unfilled Arc */}
          <path
            d={`M 5,50 A ${radius},${radius} 0 0 1 95,50`}
            fill="none"
            strokeWidth={strokeWidth}
            className={cn(colorClasses.background)}
          />

          {/* Filled Arc */}
          <path
            d={`M 5,50 A ${radius},${radius} 0 0 1 95,50`}
            fill="none"
            strokeWidth={strokeWidth}
            className={cn(colorClasses.foreground)}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />

          {/* Line indicator */}
          <line
            x1={needleStartX}
            y1={needleStartY}
            x2={needleEndX}
            y2={needleEndY}
            strokeWidth={1.4}
            className={cn(colorClasses.needle)}
          />
        </svg>

        {/* Text */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-3',
            size === 'l' ? 'pt-18 lg:pt-10' : 'pt-6 lg:pt-5',
          )}
        >
          <div
            className={cn(
              'flex items-end justify-center text-center',
              colorClasses.text,
            )}
          >
            <span
              className={cn(
                'font-semibold',
                size === 'l'
                  ? 'text-[44px] font-bold leading-none'
                  : 'title-large-24px lg:display-small-32px',
              )}
            >
              {Math.round(clampedPercentage)}
            </span>
            <span className="label-large-med-20px">%</span>
          </div>
          <span
            className={cn(
              'text-center',
              size === 'l'
                ? 'text-[22px] tracking-015px font-semibold'
                : 'title-small-sb-16px max-lg:hidden',
              colorClasses.text,
            )}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const DashGauge = ({
  className,
  completed,
  total,
  label,
  variant = 'green',
  showBackground = false,
  size = 'm',
  ...props
}: DashGaugeProps) => {
  // Clamp maxDashes between 20 and 50
  const clampedMaxDashes = Math.min(50, Math.max(20, total));

  // Dynamic stroke width based on number of dashes
  const strokeWidth = Math.floor(
    5 - ((clampedMaxDashes - 20) / (50 - 20)) * (5 - 2),
  );

  const filledDashes = Math.round((completed / total) * clampedMaxDashes);

  const radius = 44;
  const dashLength = 12;

  // Arc span
  const startAngle = 0;
  const endAngle = 180;
  const angleSpan = endAngle - startAngle;

  const dashSpacing = angleSpan / (clampedMaxDashes - 1);

  const centerX = 50;
  const centerY = 50;

  const colorClasses = gaugeVariantStyles[variant];

  const dashes = [];
  for (let i = 0; i < clampedMaxDashes; i++) {
    const angle = startAngle + i * dashSpacing;
    const radians = (angle * Math.PI) / 180;

    // Dash position
    const innerRadius = radius - dashLength / 2;
    const outerRadius = radius + dashLength / 2;

    const startX = centerX - innerRadius * Math.cos(radians);
    const startY = centerY - innerRadius * Math.sin(radians);
    const endX = centerX - outerRadius * Math.cos(radians);
    const endY = centerY - outerRadius * Math.sin(radians);

    const isFilled = i < filledDashes;

    dashes.push(
      <line
        key={i}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        strokeWidth={strokeWidth}
        className={cn(
          isFilled ? colorClasses.foreground : colorClasses.background,
        )}
      />,
    );
  }

  return (
    <div
      className={cn(
        showBackground && 'bg-white',
        gaugeContainerVariants({ size }),
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'subtitle-small-sb-14px lg:hidden',
          size === 'l' && 'hidden',
          colorClasses.text,
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          'relative h-full',
          size === 'l' ? 'w-full max-lg:h-40' : 'max-lg:w-26 lg:w-full',
        )}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          viewBox="0 0 100 55"
          className="w-full h-auto absolute top-0 left-0"
        >
          {dashes}
        </svg>

        {/* Text */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-3',
            size === 'l' ? 'pt-18 lg:pt-10' : 'pt-6 lg:pt-5',
          )}
        >
          <div
            className={cn(
              'flex items-end justify-center text-center',
              colorClasses.text,
            )}
          >
            <span
              className={cn(
                ' font-semibold',
                size === 'l'
                  ? 'text-[44px] font-bold leading-none'
                  : 'title-large-24px lg:display-small-med-32px',
              )}
            >
              {completed}
            </span>
            <span className={cn('label-18px', colorClasses.background)}>
              /{total}
            </span>
          </div>
          <span
            className={cn(
              'text-center',
              size === 'l'
                ? 'text-[22px] tracking-015px font-semibold'
                : 'title-small-sb-16px max-lg:hidden',
              colorClasses.text,
            )}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

const Clock = ({
  className,
  time,
  label,
  variant = 'blue',
  showBackground = false,
  ...props
}: ClockProps) => {
  const colorClasses = clockVariantStyles[variant];

  return (
    <div
      className={cn(
        showBackground && 'bg-white',
        gaugeContainerVariants(),
        className,
      )}
      {...props}
    >
      <span
        className={cn('subtitle-small-sb-14px lg:hidden', colorClasses.text)}
      >
        {label}
      </span>
      <div className="relative max-lg:w-26 lg:w-full h-full">
        <div
          className={cn('absolute inset-0 w-full lg:w-[124px] h-full mx-auto')}
        >
          <img src={DurationClock} alt="Duration clock" className="w-full" />
        </div>

        {/* Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 gap-3">
          <span
            className={cn(
              'text-2xl lg:text-[28px] font-semibold text-center',
              colorClasses.text,
            )}
          >
            {time}
          </span>
          <span
            className={cn(
              'title-small-sb-16px max-lg:hidden text-center',
              colorClasses.text,
            )}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

export { RadialGauge, DashGauge, Clock };
