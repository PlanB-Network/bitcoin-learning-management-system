export const ImageVideoRenderer = ({
  src,
  alt,
}: {
  src?: string;
  alt?: string;
}) => {
  if (!src) return null;

  return (
    <img
      className="mx-auto flex justify-center rounded-lg pb-6 md:pt-4 last:pb-0 last:md:pb-4"
      src={src}
      alt={alt}
    />
  );
};
