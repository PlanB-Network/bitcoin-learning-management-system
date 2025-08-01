import { AudioPlayer } from './audio-player-advanced.tsx';

interface TranslationAudioSectionProps {
  courseId: string;
  language: string;
  partId: string;
  chapterId: string;
  slideId: string;
  fileName?: string;
  audioResourcePath?: string | null;
  /** Optional title for the audio section */
  title?: string;
}

export function TranslationAudioSection({
  courseId,
  language,
  partId,
  chapterId,
  slideId,
  fileName,
  audioResourcePath,
  title,
}: TranslationAudioSectionProps) {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
      <AudioPlayer
        courseId={courseId}
        language={language}
        partId={partId}
        chapterId={chapterId}
        slideId={slideId}
        fileName={fileName}
        audioResourcePath={audioResourcePath}
      />
    </div>
  );
}
