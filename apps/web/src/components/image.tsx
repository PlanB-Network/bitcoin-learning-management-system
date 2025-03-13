type ReactImageProps = React.HTMLProps<HTMLImageElement>;

type TailwindSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

const tailwindSizesMap: Record<TailwindSizes, number> = {
  xs: 320,
  sm: 384,
  md: 448,
  lg: 512,
  xl: 576,
  '2xl': 672,
  '3xl': 768,
  '4xl': 896,
  '5xl': 1024,
  '6xl': 1152,
  '7xl': 1280,
};

interface ImageProps extends Omit<ReactImageProps, 'sizes'> {
  availableSizes?: readonly number[];
  tailwindSizes?: { [key in TailwindSizes]?: number } & { default: number };
}

const DEFAULT_AVAILABLE_SIZES = [320, 672, 1280] as const;

export const Image = ({ src, availableSizes, tailwindSizes, ...props }: ImageProps) => {

  const srcHasQuery = src?.includes('?');

  const srcSet = src && (availableSizes || DEFAULT_AVAILABLE_SIZES)
    .map((size) => `${src}${srcHasQuery ? '&' : '?'}w=${size} ${size}w`).join(', ');

  const sizes = tailwindSizes && Object.entries(tailwindSizes).sort(([a], [b]) => b === 'default' ? -1 : a === 'default' ? 1 : 0)
    .map(([key, size]) => key === 'default' ? `${size}px` : `(min-width: ${tailwindSizesMap[key as TailwindSizes]}px) ${size}px`)
    .join(', ');

  return (
    // biome-ignore lint/a11y/useAltText: Can be provided by the parent component
    <img {...props} srcSet={srcSet} sizes={sizes} />
  );
}
