import type React from 'react';
import { useEffect, useState } from 'react';

interface PptLinkProps {
  courseId: string;
  partId: string;
  chapterId: string;
  slideId: string;
  fileName: string;
  language: string;
  onValidate: () => void;
  validated: boolean;
  leftComponent?: React.ReactNode;
  // removed onSaveChanges and hasUnsavedChanges props
}

// Build the API URL that proxies the PPTX through the backend instead of exposing the raw S3 bucket.
const buildPptxApiUrl = (
  courseId: string,
  partId: string,
  chapterId: string,
  slideId: string,
  fileName: string,
  lang: string,
): string => {
  // New schema: /api/translation-downloads/pptx/<courseId>/<lang>/<partId>/<chapterId>/<slideId>/<fileName>`
  return `/api/translation-downloads/pptx/${courseId}/${lang}/${partId}/${chapterId}/${slideId}/${fileName}`;
};

export const PptLinkSection: React.FC<PptLinkProps> = ({
  courseId,
  partId,
  chapterId,
  slideId,
  fileName,
  language,
  onValidate,
  validated,
  leftComponent,
  // removed onSaveChanges and hasUnsavedChanges destructuring
}) => {
  const [exists, setExists] = useState<boolean | null>(null);

  const url = buildPptxApiUrl(
    courseId,
    partId,
    chapterId,
    slideId,
    fileName,
    language,
  );

  useEffect(() => {
    let cancelled = false;
    setExists(null);

    fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } })
      .then((res) => !cancelled && setExists(res.ok))
      .catch(() => !cancelled && setExists(false));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <>
      {/* PPTX Resource Status */}
      <div className="mb-4">
        {exists === false && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <span>⚠️</span>
            <span>
              Original slide not found - you can create a new one using the
              editor above
            </span>
          </div>
        )}
      </div>

      {/* Validate presentation PPT */}
      <div
        className={`flex flex-col sm:flex-row items-center gap-3 ${leftComponent ? 'sm:justify-between justify-center' : 'justify-center sm:justify-end'}`}
      >
        {leftComponent && (
          <div className="w-full sm:w-auto flex justify-center sm:justify-start">
            {leftComponent}
          </div>
        )}
        <button
          type="button"
          onClick={onValidate}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
        >
          <div
            className={`w-6 h-6 border-2 rounded-[4px] flex items-center justify-center ${
              validated
                ? 'bg-orange-500 border-orange-500'
                : 'bg-transparent border-gray-400'
            }`}
          >
            {validated && <span className="text-white text-sm">✓</span>}
          </div>
          <span className="text-gray-900 font-medium">
            Validate presentation PPT
            <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>
              *
            </span>
          </span>
        </button>
      </div>
    </>
  );
};
