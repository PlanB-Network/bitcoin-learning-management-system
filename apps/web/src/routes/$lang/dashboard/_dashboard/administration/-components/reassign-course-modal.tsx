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

interface ReassignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  contributors: any[];
  onSuccess: () => void;
}

export const ReassignCourseModal = ({
  isOpen,
  onClose,
  course,
  contributors,
  onSuccess,
}: ReassignCourseModalProps) => {
  const { t } = useTranslation();
  const [selectedContributorId, setSelectedContributorId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  const handleReassign = async () => {
    if (!selectedContributorId || !course?.assignmentId) return;

    setIsReassigning(true);
    try {
      // @ts-ignore - translations router should be available
      await trpcClient.content.reassignCourseToContributor.mutate({
        assignmentId: course.assignmentId,
        newAssigneeId: selectedContributorId,
      });
      onSuccess();
      setSelectedContributorId('');
    } catch (error: any) {
      console.error('Error reassigning course:', error);
      // TODO: Show error message to user
    } finally {
      setIsReassigning(false);
    }
  };

  const handleClose = () => {
    if (!isReassigning) {
      setSelectedContributorId('');
      onClose();
    }
  };

  // Filter out the currently assigned contributor
  const availableContributors = contributors.filter(
    (contributor) => contributor.uid !== course?.assigneeId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.title',
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.courseInfo',
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
              <div>
                <strong>Current Assignee:</strong>{' '}
                {course?.assigneeDisplayName || course?.assigneeUsername}
              </div>
            </div>
          </div>

          {/* New Contributor Selection */}
          <div>
            <label
              htmlFor="new-contributor-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.selectNewContributor',
              )}
            </label>
            <select
              id="new-contributor-select"
              value={selectedContributorId}
              onChange={(e) => setSelectedContributorId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-newOrange-1 focus:border-newOrange-1 outline-none"
              disabled={isReassigning}
            >
              <option value="">
                {t(
                  'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.chooseNewContributor',
                )}
              </option>
              {availableContributors.map((contributor) => (
                <option key={contributor.uid} value={contributor.uid}>
                  {contributor.displayName || contributor.username}
                  {contributor.email && ` (${contributor.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t(
                    'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.warning.title',
                  )}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {t(
                    'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.warning.description',
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isReassigning}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.cancel',
              )}
            </Button>
            <Button
              variant="primary"
              onClick={handleReassign}
              disabled={!selectedContributorId || isReassigning}
            >
              {isReassigning
                ? t(
                    'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.reassigning',
                  )
                : t(
                    'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.reassign',
                  )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
