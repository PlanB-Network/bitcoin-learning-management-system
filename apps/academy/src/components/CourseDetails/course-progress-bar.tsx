import type React from 'react';

interface CourseProgressBarProps {
  progress: number;
  completedChapters: number;
  totalChapters: number;
  progressLabel: string;
  chaptersCompletedLabel: string;
  className?: string;
}

export const CourseProgressBar: React.FC<CourseProgressBarProps> = ({
  progress,
  completedChapters,
  totalChapters,
  progressLabel,
  chaptersCompletedLabel,
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-4 rounded-lg border border-neutral-100 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700">
          {progressLabel}
        </span>
        <span className="text-sm font-medium text-neutral-900">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-neutral-100 rounded-full h-2 mb-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-neutral-500">
        {completedChapters} / {totalChapters} {chaptersCompletedLabel}
      </span>
    </div>
  );
};
