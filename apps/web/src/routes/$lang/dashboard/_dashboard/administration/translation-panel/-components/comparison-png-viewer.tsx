import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageName } from '#src/utils/i18n.js';

interface ComparisonPngViewerProps {
  courseId: string;
  language: string;
  originalLanguage: string;
  partId: string;
  chapterId: string;
  slideId: string;
  fileName: string;
  displaySlideNumber?: number;
  initialSlideNumber?: number;
  totalSlidesOverride?: number;
  forceType: 'original' | 'translated';
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

export function ComparisonPngViewer({
  courseId,
  language,
  originalLanguage,
  partId,
  chapterId,
  slideId,
  fileName,
  initialSlideNumber,
  forceType,
}: ComparisonPngViewerProps) {
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

  useEffect(() => {
    if (initialSlideNumber !== undefined) {
      setCurrentSlideIndex(Math.max(0, initialSlideNumber - 1));
      setImageLoadError(false);
    }
  }, [initialSlideNumber, slideId]);

  const hasSlides = availability?.hasSlides ?? false;
  const currentSlide = availability?.slides?.[currentSlideIndex];

  const getImageUrl = (): string | undefined => {
    if (forceType === 'original') {
      const currentSlide = availability?.slides?.[currentSlideIndex];
      if (!currentSlide?.filename) return undefined;

      return `/api/png-viewer/original/${courseId}/${originalLanguage}/${partId}/${chapterId}/${slideId}/${encodeURIComponent(fileName)}/${currentSlide.filename}`;
    }

    // For translated version
    return `/api/png-viewer/translated/${courseId}/${language}/${partId}/${chapterId}/${slideId}/${encodeURIComponent(fileName)}/${currentSlideIndex + 1}`;
  };

  const targetLanguage = forceType === 'original' ? originalLanguage : language;

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
      <div className="flex items-center gap-[10px] mb-5">
        <span
          className="text-base font-semibold text-gray-900"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          Language :
        </span>
        <span
          className="text-orange-500 text-base"
          style={{ fontFamily: 'Rubik, sans-serif' }}
        >
          {getLanguageName(targetLanguage)}
        </span>
      </div>

      {/* PNG Content */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
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
                  src={getImageUrl()}
                  alt={`${forceType} slide ${currentSlideIndex + 1}`}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    console.error('Failed to load image:', e);
                    setImageLoadError(true);
                  }}
                />
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <title>Image not found</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      {forceType === 'original' ? 'Original' : 'Translated'}{' '}
                      slide {currentSlideIndex + 1} not available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>No slides found</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2">
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
