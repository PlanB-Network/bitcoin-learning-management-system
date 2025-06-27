import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineViewGrid } from 'react-icons/hi';

import { CommonModal } from '#src/components/ui/common-modal.tsx';
import { trpcClient } from '#src/utils/trpc.js';

interface AssignCourseModalProps {
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
  const [isAssigned, setIsAssigned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && !isAssigned) {
      setSelectedContributorId('');
      setErrorMessage('');
    }
  }, [isOpen, isAssigned]);

  const handleAssign = async () => {
    if (!selectedContributorId || !course) return;

    setIsAssigning(true);
    setErrorMessage('');

    try {
      await trpcClient.user.translation.assignCourseToContributor.mutate({
        courseId: course.courseId,
        language: course.language,
        assigneeId: selectedContributorId,
      });

      setIsAssigned(true);
    } catch (error: any) {
      console.error('Error assigning course:', error);
      setErrorMessage(error.message || 'Failed to assign course');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    if (isAssigned && onSuccess) {
      onSuccess();
    }
    setIsAssigned(false);
    setSelectedContributorId('');
    setErrorMessage('');
    onClose();
  };

  const getContributorDisplayName = (contributor: Contributor) => {
    return contributor.displayName || contributor.username || contributor.email;
  };

  if (isAssigned) {
    return (
      <CommonModal
        isOpen={isOpen}
        onClose={handleClose}
        title={t(
          'dashboard.adminPanel.translationPanel.contentManagement.assignModal.assignmentSuccess',
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
        'dashboard.adminPanel.translationPanel.contentManagement.assignModal.title',
      )}
      icon={<HiOutlineViewGrid />}
      errorMessage={errorMessage}
      actions={
        <>
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            onClick={handleClose}
            disabled={isAssigning}
          >
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.assignModal.cancel',
            )}
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Course Info */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            {t(
              'dashboard.adminPanel.translationPanel.contentManagement.assignModal.assigningCourse',
            )}
          </p>
          <p className="font-medium text-gray-900">
            {course?.courseName || course?.courseId}
          </p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            disabled={isAssigning}
          >
            <option value="">
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.assignModal.chooseContributor',
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
      </div>
    </CommonModal>
  );
};
