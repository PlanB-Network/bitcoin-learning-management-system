import { cn } from '@blms/ui';
import type React from 'react'; // React is required for React.ReactNode

interface HeroProps {
  /** The content for the main title, can be a string or a React element. */
  titleElement: React.ReactNode;
  /** The subtitle text. */
  subtitle: string;
  /** The source URL for the hero image. */
  imageUrl?: string;
  /** Optional class name for the container. */
  className?: string;
}

export const Hero = ({
  titleElement,
  subtitle,
  imageUrl,
  className = '',
}: HeroProps) => {
  return (
    <div className={cn('relative flex flex-col', className)}>
      {/* Conditionally render the image if imageUrl is provided */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Hero background" // Always include a descriptive alt text
          className=" w-full h-auto object-cover mb-4"
        />
      )}

      <div className="absolute left-2 max-w-[470px] flex flex-col gap-20 h-full">
        <h1 className="text-7xl leading-24">{titleElement}</h1>
        <p className="title-medium">{subtitle}</p>
      </div>
    </div>
  );
};
