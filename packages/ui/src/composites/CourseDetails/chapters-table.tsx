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
                      {getProgressPercentage(chapter.status)}
                    </TableCell>
                    {onChapterAction && (
                      <TableCell className="py-4 text-center">
                        <Button
                          size="s"
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => onChapterAction(chapter.chapterId)}
                        >
                          {actionButtonText}
                        </Button>
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
