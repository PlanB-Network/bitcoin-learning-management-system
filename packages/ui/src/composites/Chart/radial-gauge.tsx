import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '#src/lib/utils.ts';

import DurationClock from '#src/assets/charts/duration.webp';

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
  'flex items-center max-lg:justify-between relative justify-center rounded-2xl',
  {
    variants: {
      size: {
        m: 'w-66 lg:w-40 px-3 py-5 lg:flex-col',
        l: 'w-full max-w-54 lg:max-w-[336px] lg:px-14 my-7 flex-col',
      },
    },
    defaultVariants: {
      size: 'm',
    },
  },
);

const GAUGE_RADIUS = 45;
const GAUGE_STROKE_WIDTH = 10;
const SVG_VIEWBOX = '0 0 100 55';
const SVG_CENTER_X = 50;
const SVG_CENTER_Y = 50;

const MOBILE_LABEL_CLASSES = 'subtitle-small-sb-14px lg:hidden';

const getSvgContainerClasses = (size: 'm' | 'l') =>
  cn('relative', size === 'l' ? 'w-full' : 'max-lg:w-26 lg:w-full');

const getMainTextClasses = (size: 'm' | 'l') =>
  cn(
    'font-semibold',
    size === 'l'
      ? 'text-[44px] font-bold leading-0'
      : 'title-large-24px lg:display-small-32px leading-0',
  );

const getLabelTextClasses = (size: 'm' | 'l') =>
  cn(
    'text-center',
    size === 'l'
      ? 'text-[22px] tracking-015px font-semibold pt-5'
      : 'title-small-sb-16px max-lg:hidden lg:pt-3',
  );

const getTextContainerClasses = (size: 'm' | 'l') =>
  cn('text-center w-full absolute', size === 'l' ? 'bottom-2' : 'bottom-0.5');

const MobileLabel = ({
  label,
  colorClasses,
  size,
}: {
  label: string;
  colorClasses: { text: string };
  size: 'm' | 'l';
}) => (
  <span
    className={cn(
      MOBILE_LABEL_CLASSES,
      size === 'l' && 'hidden',
      colorClasses.text,
    )}
  >
    {label}
  </span>
);

const GaugeContainer = ({
  children,
  className,
  showBackground,
  size,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  showBackground: boolean;
  size: 'm' | 'l';
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      showBackground && 'bg-white',
      gaugeContainerVariants({ size }),
      className,
    )}
    {...props}
  >
    {children}
  </div>
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
  size?: 'm' | 'l';
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
  const colorClasses = gaugeVariantStyles[variant];

  const circumference = GAUGE_RADIUS * Math.PI;
  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;

  const needleAngle = (clampedPercentage / 100) * 180;
  const needleRadians = (needleAngle * Math.PI) / 180;
  const innerRadius = GAUGE_RADIUS - GAUGE_STROKE_WIDTH / 2 - 1;
  const outerRadius = GAUGE_RADIUS + GAUGE_STROKE_WIDTH / 2 + 1;

  const needleStartX = SVG_CENTER_X - innerRadius * Math.cos(needleRadians);
  const needleStartY = SVG_CENTER_Y - innerRadius * Math.sin(needleRadians);
  const needleEndX = SVG_CENTER_X - outerRadius * Math.cos(needleRadians);
  const needleEndY = SVG_CENTER_Y - outerRadius * Math.sin(needleRadians);

  const arcPath = `M 5,50 A ${GAUGE_RADIUS},${GAUGE_RADIUS} 0 0 1 95,50`;

  return (
    <GaugeContainer
      className={className}
      showBackground={showBackground}
      size={size}
      {...props}
    >
      <MobileLabel label={label} colorClasses={colorClasses} size={size} />

      <div className={getSvgContainerClasses(size)}>
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg viewBox={SVG_VIEWBOX} className="w-full">
          {/* Unfilled */}
          <path
            d={arcPath}
            fill="none"
            strokeWidth={GAUGE_STROKE_WIDTH}
            className={cn(colorClasses.background)}
          />

          {/* Filled */}
          <path
            d={arcPath}
            fill="none"
            strokeWidth={GAUGE_STROKE_WIDTH}
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
        <div className={cn(colorClasses.text, getTextContainerClasses(size))}>
          <span className={getMainTextClasses(size)}>
            {Math.round(clampedPercentage)}
          </span>
          <span className="label-large-med-20px leading-0">%</span>
        </div>
      </div>
      <span className={cn(getLabelTextClasses(size), colorClasses.text)}>
        {label}
      </span>
    </GaugeContainer>
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
  const colorClasses = gaugeVariantStyles[variant];

  const DASH_LENGTH = 10;
  const MIN_DASHES = 20;
  const MAX_DASHES = 50;
  const MIN_STROKE_WIDTH = 2;
  const MAX_STROKE_WIDTH = 5;
  const ARC_START_ANGLE = 0;
  const ARC_END_ANGLE = 180;

  const clampedMaxDashes = Math.min(MAX_DASHES, Math.max(MIN_DASHES, total));
  const strokeWidth = Math.floor(
    MAX_STROKE_WIDTH -
      ((clampedMaxDashes - MIN_DASHES) / (MAX_DASHES - MIN_DASHES)) *
        (MAX_STROKE_WIDTH - MIN_STROKE_WIDTH),
  );
  const filledDashes = Math.round((completed / total) * clampedMaxDashes);
  const angleSpan = ARC_END_ANGLE - ARC_START_ANGLE;
  const dashSpacing = angleSpan / (clampedMaxDashes - 1);

  const dashes = [];
  for (let dashIndex = 0; dashIndex < clampedMaxDashes; dashIndex++) {
    const angle = ARC_START_ANGLE + dashIndex * dashSpacing;
    const radians = (angle * Math.PI) / 180;

    const innerRadius = GAUGE_RADIUS - DASH_LENGTH / 2;
    const outerRadius = GAUGE_RADIUS + DASH_LENGTH / 2;

    const startX = SVG_CENTER_X - innerRadius * Math.cos(radians);
    const startY = SVG_CENTER_Y - innerRadius * Math.sin(radians);
    const endX = SVG_CENTER_X - outerRadius * Math.cos(radians);
    const endY = SVG_CENTER_Y - outerRadius * Math.sin(radians);

    const isFilled = dashIndex < filledDashes;

    dashes.push(
      <line
        key={dashIndex}
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
    <GaugeContainer
      className={className}
      showBackground={showBackground}
      size={size}
      {...props}
    >
      <MobileLabel label={label} colorClasses={colorClasses} size={size} />

      <div className={getSvgContainerClasses(size)}>
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg viewBox={SVG_VIEWBOX} className="w-full">
          {dashes}
        </svg>

        {/* Text */}
        <div className={cn(colorClasses.text, getTextContainerClasses(size))}>
          <span className={getMainTextClasses(size)}>{completed}</span>
          <span className={cn('label-18px leading-0', colorClasses.background)}>
            /{total}
          </span>
        </div>
      </div>
      <span className={cn(getLabelTextClasses(size), colorClasses.text)}>
        {label}
      </span>
    </GaugeContainer>
  );
};

const Clock = ({
  className,
  time,
  label,
  variant = 'blue',
  size = 'm',
  showBackground = false,
  ...props
}: ClockProps) => {
  const colorClasses = clockVariantStyles[variant];

  return (
    <GaugeContainer
      className={className}
      showBackground={showBackground}
      size={size}
      {...props}
    >
      <MobileLabel label={label} colorClasses={colorClasses} size={size} />

      <div className={getSvgContainerClasses(size)}>
        <img src={DurationClock} alt="Duration clock" className="w-full" />

        {/* Text */}
        <div className={cn(colorClasses.text, getTextContainerClasses(size))}>
          <span className={getMainTextClasses(size)}>{time}</span>
        </div>
      </div>

      <span className={cn(getLabelTextClasses(size), colorClasses.text)}>
        {label}
      </span>
    </GaugeContainer>
  );
};

export { RadialGauge, DashGauge, Clock };
