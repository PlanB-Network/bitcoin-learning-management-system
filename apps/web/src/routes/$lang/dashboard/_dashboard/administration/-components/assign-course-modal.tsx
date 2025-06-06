import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@blms/ui';

import { trpcClient } from '#src/utils/trpc.js';

interface AssignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  contributors: any[];
  onSuccess: () => void;
}

export const AssignCourseModal = ({
  isOpen,
  onClose,
  course,
  contributors,
  onSuccess,
}: AssignCourseModalProps) => {
  const { t } = useTranslation();
  const [selectedContributorId, setSelectedContributorId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedContributorId || !course) return;

    setIsAssigning(true);
    try {
      // @ts-ignore - translations router should be available
      await trpcClient.content.assignCourseToContributor.mutate({
        courseId: course.courseId,
        language: course.language,
        assigneeId: selectedContributorId,
      });

      // Success handling
      onSuccess();
      setSelectedContributorId('');
    } catch (error: any) {
      console.error('Error assigning course:', error);
      // TODO: Show error message to user
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    if (!isAssigning) {
      setSelectedContributorId('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.assignModal.title',
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.assignModal.courseInfo',
              )}
            </h4>
            <div className="text-sm text-gray-600">
              <div>
                <strong>Index:</strong> {course?.courseIndex}
              </div>
              <div>
                <strong>Course:</strong>{' '}
                {course?.courseName || course?.courseId}
              </div>
              <div>
                <strong>Language:</strong> {course?.language?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Contributor Selection */}
          <div>
            <label
              htmlFor="contributor-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.assignModal.selectContributor',
              )}
            </label>
            <select
              id="contributor-select"
              value={selectedContributorId}
              onChange={(e) => setSelectedContributorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-newOrange-1 focus:border-newOrange-1 outline-none"
              disabled={isAssigning}
            >
              <option value="">
                {t(
                  'dashboard.adminPanel.translationPanel.contentManagement.assignModal.chooseContributor',
                )}
              </option>
              {contributors.map((contributor) => (
                <option key={contributor.uid} value={contributor.uid}>
                  {contributor.displayName || contributor.username}
                  {contributor.email && ` (${contributor.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAssigning}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.assignModal.cancel',
              )}
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selectedContributorId || isAssigning}
            >
              {isAssigning
                ? t(
                    'dashboard.adminPanel.translationPanel.contentManagement.assignModal.assigning',
                  )
                : t(
                    'dashboard.adminPanel.translationPanel.contentManagement.assignModal.assign',
                  )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
