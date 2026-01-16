import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationLanguageHeader } from './translation-language-header.tsx';

interface PngViewerProps {
  courseId: string;
  language: string; // This is the translation language
  originalLanguage: string; // This is the original language of the course
  partId: string;
  chapterId: string;
  slideId: string;
  fileName: string;
  /** Slide number in course context (1-based) for header override */
  displaySlideNumber?: number;
  /** Desired initial slide index (1-based) inside PPT when mounting */
  initialSlideNumber?: number;
  /** Total slides in chapter (for header override) */
  totalSlidesOverride?: number;
}

interface PngAvailability {
  hasSlides: boolean;
  totalSlides: number;
  slides: Array<{
    slideNumber: number;
    filename: string;
    original: boolean;
    translated: boolean;
  }>;
  original: boolean;
  translated: boolean;
  canCompare: boolean;
  originalPngFiles: string[];
}

export function PngViewer({
  courseId,
  language,
  originalLanguage,
  partId,
  chapterId,
  slideId,
  fileName,
  initialSlideNumber,
}: PngViewerProps) {
  const { t } = useTranslation();
  const [availability, setAvailability] = useState<PngAvailability | null>(
    null,
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(
    (initialSlideNumber ?? 1) - 1,
  );
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/png-viewer/availability/${courseId}/${language}/${originalLanguage}/${partId}/${chapterId}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAvailability(data);
        if (data.slides && data.slides.length > 0) {
          // Ensure the index is within bounds, otherwise reset to 0
          setCurrentSlideIndex((prev) => {
            if (prev >= 0 && prev < data.slides.length) return prev;
            return 0;
          });
        }
      } catch (err) {
        console.error('Error fetching PNG availability:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [courseId, language, originalLanguage, partId, chapterId]);

  // Reset internal index when requested slide changes
  useEffect(() => {
    if (initialSlideNumber !== undefined) {
      setCurrentSlideIndex(Math.max(0, initialSlideNumber - 1));
      setImageLoadError(false); // Reset error state on slide change
    }
  }, [initialSlideNumber, slideId]);

  const hasSlides = availability?.hasSlides ?? false;
  const currentSlide = availability?.slides?.[currentSlideIndex];

  const getImageUrl = (type: 'original' | 'translated'): string | undefined => {
    if (type === 'original') {
      const currentSlide = availability?.slides?.[currentSlideIndex];
      if (!currentSlide?.filename) return undefined;

      return `/api/png-viewer/original/${courseId}/${originalLanguage}/${partId}/${chapterId}/${slideId}/${encodeURIComponent(fileName)}/${currentSlide.filename}`;
    }
    return `/api/png-viewer/translated/${courseId}/${language}/${partId}/${chapterId}/${slideId}/${encodeURIComponent(fileName)}/${currentSlideIndex + 1}`;
  };

  return (
    <div
      style={{
        backgroundColor: '#F5F5F5',
        border: '1px solid #D1D5DB',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0px 1px 1px 0px #00000040',
      }}
    >
      {/* Language Header */}
      <TranslationLanguageHeader
        originalLanguage={originalLanguage}
        targetLanguage={language}
      />

      {/* PNG Content */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center bg-neutral-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">
                {t('translate.loadingPresentation', {
                  defaultValue: 'Loading presentation...',
                })}
              </p>
            </div>
          </div>
        ) : hasSlides && currentSlide ? (
          <div className="space-y-4">
            {/* Image Display */}
            <div className="flex justify-center p-4">
              {!imageLoadError ? (
                <img
                  src={getImageUrl(
                    currentSlide.original ? 'original' : 'translated',
                  )}
                  alt={`Slide ${currentSlideIndex + 1}`}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    console.error('Failed to load image:', e);
                    setImageLoadError(true);
                  }}
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-neutral-100 rounded-lg">
                  <div className="text-center">
                    <div className="text-neutral-500 mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <title>
                          {t('translate.imageNotFound', {
                            defaultValue: 'Image not found',
                          })}
                        </title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {t('translate.slideNotAvailable', {
                        defaultValue: 'Slide {{slideNumber}} not available',
                        slideNumber: currentSlideIndex + 1,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-neutral-100">
            <div className="text-center">
              <div className="text-neutral-500 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>
                    {t('translate.noSlidesFound', {
                      defaultValue: 'No slides found',
                    })}
                  </title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-neutral-500 mb-2">
                {t('translate.noPngSlides', {
                  defaultValue: 'No PNG slides available for this presentation',
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
