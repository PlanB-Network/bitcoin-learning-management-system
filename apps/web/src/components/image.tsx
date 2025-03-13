type ReactImageProps = React.HTMLProps<HTMLImageElement>;

type TailwindSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// https://v3.tailwindcss.com/docs/theme#screens
const breakpointsMap: Record<TailwindSizes, number> = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
};

interface ImageProps extends Omit<ReactImageProps, 'sizes'> {
  breakpoints: { [key in TailwindSizes]?: number } & { default: number };
}

export const Image = ({ src, breakpoints, ...props }: ImageProps) => {
  const srcHasQuery = src?.includes('?');

  const sortedBreakpoints = Object.entries(breakpoints).sort(
    ([a, va], [b, vb]) =>
      b === 'default' ? -1 : a === 'default' ? 1 : va - vb,
  );

  const availableSizes = sortedBreakpoints
    .map(([, size]) => size)
    .sort((a, b) => a - b);

  const srcSet =
    src &&
    availableSizes
      .map((size) => `${src}${srcHasQuery ? '&' : '?'}w=${size} ${size}w`)
      .join(', ');

  const sizes =
    breakpoints &&
    sortedBreakpoints
      .map(([key, size]) =>
        key === 'default'
          ? `${size}px`
          : `(min-width: ${breakpointsMap[key as TailwindSizes]}px) ${size}px`,
      )
      .join(', ');

  return (
    // biome-ignore lint/a11y/useAltText: Can be provided by the parent component
    <img {...props} srcSet={srcSet} sizes={sizes} />
  );
};
