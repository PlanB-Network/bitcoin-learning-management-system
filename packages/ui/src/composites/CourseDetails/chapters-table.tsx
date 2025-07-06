import { getProgressPercentage } from '@blms/shared';
import type { CoursePartDetails } from '@blms/types';
import type React from 'react';
import { Button } from '../../bases/button.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../bases/table.js';
import { CourseStatusBadge } from './course-status-badge.js';

interface ChaptersTableProps {
  parts: CoursePartDetails[];
  onChapterAction?: (chapterId: string) => void;
  // Default action text for not-started chapters
  actionButtonText: string;
  getStatusText: (status: string) => string;
  // Labels for localization
  labels: {
    partTitle: (index: number, title: string) => string;
    chapterIndex: string;
    chapterTitle: string;
    status: string;
    progress: string;
    actions: string;
    noChapters: string;
    proofreadText?: string; // Optional overrides (fallback to actionButtonText)
    resumeText?: string;
    reviewText?: string;
  };
  className?: string;
}

export const ChaptersTable: React.FC<ChaptersTableProps> = ({
  parts,
  onChapterAction,
  actionButtonText,
  getStatusText,
  labels,
  className = '',
}) => {
  if (!parts || parts.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        {labels.noChapters}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {parts.map((part) => (
        <div key={part.partId} className="border rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium text-gray-900">
              {labels.partTitle(
                part.partIndex,
                part.partTitle || `Part ${part.partIndex}`,
              )}
            </h3>
          </div>

          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">{labels.chapterIndex}</TableHead>
                  <TableHead>{labels.chapterTitle}</TableHead>
                  <TableHead className="w-32">{labels.status}</TableHead>
                  <TableHead className="w-24">{labels.progress}</TableHead>
                  {onChapterAction && (
                    <TableHead className="w-32">{labels.actions}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {part.chapters.map((chapter) => (
                  <TableRow
                    key={chapter.chapterId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <TableCell className="py-4 font-medium text-gray-900">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                        {chapter.chapterIndex}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-medium text-gray-900 break-words">
                        {chapter.chapterTitle ||
                          `Chapter ${chapter.chapterIndex}`}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <CourseStatusBadge
                        status={chapter.status}
                        statusText={getStatusText(chapter.status)}
                      />
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-700">
                      {(() => {
                        const totalSteps = (chapter as any).totalSteps;
                        const validatedSteps = (chapter as any).validatedSteps;

                        if (typeof totalSteps === 'number' && totalSteps > 0) {
                          const percent = Math.round(
                            (Math.min(validatedSteps || 0, totalSteps) /
                              totalSteps) *
                              100,
                          );
                          return `${percent}%`;
                        }

                        // Fallback to slide-level calc if available
                        const totalSlides = (chapter as any).totalSlides;
                        const completedSlides = (chapter as any)
                          .completedSlides;
                        if (
                          typeof totalSlides === 'number' &&
                          totalSlides > 0
                        ) {
                          const percent = Math.round(
                            (Math.min(completedSlides || 0, totalSlides) /
                              totalSlides) *
                              100,
                          );
                          return `${percent}%`;
                        }

                        // Fallback to status-based percentage
                        return getProgressPercentage(chapter.status);
                      })()}
                    </TableCell>
                    {onChapterAction && (
                      <TableCell className="py-4 text-center">
                        {(() => {
                          const status = chapter.status as string;

                          // Determine label and style based on status
                          const proofreadText =
                            labels.proofreadText || actionButtonText;
                          const resumeText = labels.resumeText || 'Resume';
                          const reviewText = labels.reviewText || 'Review';

                          let label = proofreadText;
                          let btnClass =
                            'bg-orange-500 hover:bg-orange-600 text-white';

                          if (status === 'completed') {
                            label = reviewText;
                            btnClass =
                              'border border-orange-500 text-orange-500 bg-transparent hover:bg-orange-50';
                          } else if (status === 'in-progress') {
                            label = resumeText;
                            // keep orange background
                          }

                          return (
                            <Button
                              size="s"
                              className={btnClass}
                              onClick={() => onChapterAction(chapter.chapterId)}
                            >
                              {label}
                            </Button>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};
