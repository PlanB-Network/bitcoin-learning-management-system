import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiExclamation, HiOutlineViewGrid } from 'react-icons/hi';

import { CommonModal } from '#src/components/ui/common-modal.tsx';
import { trpcClient } from '#src/utils/trpc.js';

interface ReassignCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  contributors: Contributor[];
  onSuccess?: () => void;
}

interface Contributor {
  uid: string;
  username: string | null;
  displayName: string | null;
  email: string;
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
  const [isReassigned, setIsReassigned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && !isReassigned) {
      setSelectedContributorId('');
      setErrorMessage('');
    }
  }, [isOpen, isReassigned]);

  const handleReassign = async () => {
    if (!selectedContributorId) return;

    setIsReassigning(true);
    setErrorMessage('');

    try {
      await trpcClient.content.reassignCourseToContributor.mutate({
        assignmentId: course.assignmentId,
        newAssigneeId: selectedContributorId,
      });

      setIsReassigned(true);
    } catch (error: any) {
      console.error('Error reassigning course:', error);
      setErrorMessage(error.message || 'Failed to reassign course');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleClose = () => {
    if (isReassigned && onSuccess) {
      onSuccess();
    }
    setIsReassigned(false);
    setSelectedContributorId('');
    setErrorMessage('');
    onClose();
  };

  const getContributorDisplayName = (contributor: Contributor) => {
    return contributor.displayName || contributor.username || contributor.email;
  };

  if (isReassigned) {
    return (
      <CommonModal
        isOpen={isOpen}
        onClose={handleClose}
        title={t(
          'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.reassignmentSuccess',
        )}
        icon={<HiOutlineViewGrid />}
        actions={
          <button
            type="button"
            className="px-6 py-2 border border-orange-500 text-orange-500 rounded hover:bg-orange-50 transition-colors"
            onClick={handleClose}
          >
            {t('dashboard.adminPanel.translationPanel.modal.close')}
          </button>
        }
      >
        <div />
      </CommonModal>
    );
  }

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t(
        'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.title',
      )}
      icon={<HiOutlineViewGrid />}
      errorMessage={errorMessage}
      actions={
        <>
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            onClick={handleClose}
            disabled={isReassigning}
          >
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.cancel',
            )}
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Course Info */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.reassigningCourse',
            )}
          </p>
          <p className="font-medium text-gray-900">
            {course?.courseName || course?.courseId}
          </p>
          <p className="text-sm text-gray-500">
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.currentlyAssignedTo',
            )}{' '}
            {course?.assigneeDisplayName || course?.assigneeUsername || ''}
          </p>
        </div>

        {/* Contributor Selection */}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            disabled={isReassigning}
          >
            <option value="">
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.reassignModal.chooseNewContributor',
              )}
            </option>
            {contributors.map((contributor: Contributor) => (
              <option key={contributor.uid} value={contributor.uid}>
                {getContributorDisplayName(contributor)}
                {contributor.email && ` (${contributor.email})`}
              </option>
            ))}
          </select>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiExclamation className="h-5 w-5 text-yellow-400" />
            </div>
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
      </div>
    </CommonModal>
  );
};
