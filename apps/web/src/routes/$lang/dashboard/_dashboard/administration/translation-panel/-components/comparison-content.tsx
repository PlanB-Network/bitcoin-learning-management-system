import { ComparisonPngViewer } from './comparison-png-viewer.tsx';
import { ComparisonTextViewer } from './comparison-text-viewer.tsx';

interface ComparisonContentProps {
  activeTab: 'presentations' | 'content';
  currentSlide: any;
  courseId: string;
  language: string;
  originalLanguage: string;
  chapterId: string;
  currentSlideIndex: number;
}

export function ComparisonContent({
  activeTab,
  currentSlide,
  courseId,
  language,
  originalLanguage,
  chapterId,
  currentSlideIndex,
}: ComparisonContentProps) {
  if (!currentSlide) return null;

  if (activeTab === 'presentations') {
    return (
      <div className="mt-2 space-y-6">
        {/* Original Version */}
        <div className="space-y-4">
          <ComparisonPngViewer
            courseId={courseId}
            language={originalLanguage}
            originalLanguage={originalLanguage}
            partId={currentSlide.partId}
            chapterId={chapterId}
            slideId={currentSlide.slideId}
            fileName={currentSlide.pptResourcePath as string}
            displaySlideNumber={currentSlide.slideNumber}
            initialSlideNumber={currentSlideIndex + 1}
            forceType="original"
          />
        </div>

        {/* Translated Version */}
        <div className="space-y-4">
          <ComparisonPngViewer
            courseId={courseId}
            language={language}
            originalLanguage={originalLanguage}
            partId={currentSlide.partId}
            chapterId={chapterId}
            slideId={currentSlide.slideId}
            fileName={currentSlide.pptResourcePath as string}
            displaySlideNumber={currentSlide.slideNumber}
            initialSlideNumber={currentSlideIndex + 1}
            forceType="translated"
          />
        </div>
      </div>
    );
  }

  if (activeTab === 'content') {
    return (
      <div className="mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Content */}
          <ComparisonTextViewer
            content={currentSlide.originalContent}
            language={originalLanguage}
          />

          {/* Translated Content */}
          <ComparisonTextViewer
            content={currentSlide.translatedContent}
            language={language}
          />
        </div>
      </div>
    );
  }

  return null;
}
