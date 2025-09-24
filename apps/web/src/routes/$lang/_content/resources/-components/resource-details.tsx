import {
  Button,
  Carousel,
  CarouselContent,
  CarouselFadeEdges,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Flag,
  Image,
  TextTag,
} from '@blms/ui';
import { Link } from '@tanstack/react-router';
import type { FunctionComponent, SVGProps } from 'react';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons/lib';
import { useSmaller } from '#src/hooks/use-smaller.ts';
import { fixEmbedUrl } from '#src/utils/misc.ts';
import { SuggestedHeader } from './suggested-header.tsx';

interface ResourceDetailsProps {
  title: string;
  imgSrc: string;
  language?: string | string[];
  subtitle?: string;
  button?: {
    label: string;
    href: string;
  };
  mediaLinks?: {
    icon: IconType | FunctionComponent<SVGProps<SVGSVGElement>>;
    href: string;
  }[];
  tags?: string[];
  abstract?: string;
  trailer?: string;
  suggestedHeaderText?: string;
  suggestedResources?: { title: string; imgSrc: string; href: string }[];
}

export const ResourceDetails = ({
  title,
  imgSrc,
  language,
  subtitle,
  button,
  mediaLinks,
  tags,
  abstract,
  trailer,
  suggestedHeaderText,
  suggestedResources,
}: ResourceDetailsProps) => {
  const isMobile = useSmaller('md');

  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col gap-6 md:gap-20">
      <article className="flex flex-col w-full gap-6 md:gap-7.5">
        <div className="flex max-md:flex-col md:items-center gap-6 md:gap-4">
          <Image
            breakpoints={{ default: 232 }}
            className="max-md:mx-auto max-md:aspect-auto max-md:max-w-50 md:w-58 h-auto md:max-h-54 object-cover [overflow-clip-margin:_unset] rounded-xl"
            alt={title}
            src={imgSrc}
          />
          <div className="flex flex-col gap-6 md:gap-5.5 w-full">
            <div className="flex flex-col md:gap-1.5 w-full max-md:order-2">
              <h1 className="max-md:display-small-32px max-md:!font-semibold md:display-medium flex gap-2 w-full justify-between items-center">
                {title}
                {language &&
                  (Array.isArray(language) ? (
                    <div className="flex flex-col gap-1 shrink-0 max-md:!hidden">
                      {language.slice(0, 2).map((lang) => (
                        <Flag
                          key={lang}
                          code={lang}
                          size="l"
                          className="shrink-0"
                        />
                      ))}
                    </div>
                  ) : (
                    <Flag
                      code={language}
                      size="l"
                      className="shrink-0 max-md:!hidden"
                    />
                  ))}
              </h1>
              {subtitle && (
                <span className="body-small md:title-medium text-neutral-600">
                  {subtitle}
                </span>
              )}

              {mediaLinks && mediaLinks.length > 0 && (
                <div className="flex items-center gap-4 text-neutral-600 max-md:order-2 mt-2 md:mt-2.5">
                  {mediaLinks.map(({ icon, href }, index) => {
                    const Icon = icon;
                    return (
                      <a
                        // biome-ignore lint/suspicious/noArrayIndexKey: <N/A>
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon size={24} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {tags && (
              <div className="flex flex-wrap gap-1 max-md:order-2">
                {tags.map((tag) => (
                  <TextTag
                    key={tag}
                    size="base"
                    color="grey"
                    className="capitalize"
                  >
                    {tag}
                  </TextTag>
                ))}
              </div>
            )}
            {button && (
              <Button
                variant={'primary'}
                asChild
                className="max-md:order-1 max-md:w-full max-md:mx-auto max-md:max-w-88"
              >
                <a href={button.href} target="_blank" rel="noopener noreferrer">
                  {button.label}
                </a>
              </Button>
            )}
          </div>
        </div>
        {abstract && (
          <div className="flex flex-col gap-1">
            <span className="subtitle-base md:title-base">
              {t('words.abstract')}
            </span>
            <p className="body-small md:body-base whitespace-pre-line">
              {abstract}
            </p>
          </div>
        )}
      </article>

      {trailer && (
        <div className="flex flex-col w-full gap-1">
          <h3 className="subtitle-base md:title-base">
            {t('youtubeChannels.watchTrailer')}
          </h3>

          <div className="mx-auto max-w-full w-full aspect-video">
            <iframe
              width={'100%'}
              height={'100%'}
              className="mx-auto rounded-lg"
              src={fixEmbedUrl(trailer ?? '')}
              title="Channel Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {suggestedHeaderText && suggestedResources ? (
        <section className="flex flex-col gap-1 md:gap-6 w-full">
          <SuggestedHeader text={suggestedHeaderText} />
          <Carousel opts={{ slidesToScroll: 2, duration: 14 }}>
            <CarouselContent>
              {suggestedResources.slice(0, 10).map((suggestedResource) => {
                return (
                  <CarouselItem
                    key={suggestedResource.title}
                    className="text-white rounded-sm"
                  >
                    <Link
                      to={suggestedResource.href}
                      className="min-w-38 max-w-38 h-55"
                    >
                      <div className="relative w-full">
                        <Image
                          breakpoints={{ default: 300 }}
                          className="object-cover [overflow-clip-margin:_unset] rounded-sm min-w-38 max-w-38 h-55"
                          alt={suggestedResource.title}
                          src={suggestedResource.imgSrc}
                        />
                        <div
                          className="absolute inset-0 -bottom-px rounded-sm min-w-38 max-w-38 h-55"
                          style={{
                            background: `linear-gradient(360deg, rgba(40, 33, 33, 0.90) 10%, rgba(0, 0, 0, 0.00) 60%),
                                  linear-gradient(0deg, rgba(57, 53, 49, 0.20) 0%, rgba(57, 53, 49, 0.20) 100%)`,
                            backgroundPosition: '-5.216px 0px',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '153.647% 100%',
                          }}
                        />
                      </div>

                      <h3 className="absolute w-38 px-2 body-14px bottom-2.5 line-clamp-2">
                        {suggestedResource.title}
                      </h3>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious
              variant="primary"
              rounded
              className="z-10 -left-2 max-md:hidden"
            />
            <CarouselNext
              variant="primary"
              rounded
              className="z-10 -right-2 max-md:hidden"
            />
            {!isMobile && <CarouselFadeEdges />}
          </Carousel>
        </section>
      ) : null}
    </div>
  );
};
