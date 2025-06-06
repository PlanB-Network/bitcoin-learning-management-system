import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaRegTrashAlt } from 'react-icons/fa';
import { HiOutlineChatAlt2, HiOutlineViewGrid } from 'react-icons/hi';

import {
  Button,
  Loader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@blms/ui';

import { AssignmentStatus } from '@blms/constants';
import { getLanguageName } from '#src/utils/i18n.ts';
import { trpcClient } from '#src/utils/trpc.js';

// Import the correct logo asset
import PlanBLogoBlack from '#src/assets/logo/planb_logo_horizontal_black_orangepill_gradient.svg';

interface TranslationRequest {
  id: string;
  courseId: string;
  language: string;
  assigneeId: string;
  assignerId: string;
  status: string;
  assignedAt: Date;
  completedAt?: Date;
  rejectionReason?: string;
  courseIndex: string;
  courseName: string;
  assigneeUsername: string;
  assignerUsername: string;
}

interface TranslationRequestsTableProps {
  status: 'requested' | 'rejected';
  searchQuery?: string;
}

export const TranslationRequestsTable = ({
  status,
  searchQuery = '',
}: TranslationRequestsTableProps) => {
  const { t } = useTranslation();
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(
    new Set(),
  );
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<TranslationRequest | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Separate state for success modal that persists independently
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Track previous status to detect actual tab changes
  const previousStatusRef = useRef(status);
  const isInitialRender = useRef(true);

  // State for requests data
  const [requests, setRequests] = useState<TranslationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch translation assignment requests using trpcClient
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      // @ts-ignore - translations router should be available
      const data =
        await trpcClient.content.getTranslationAssignmentRequests.query({
          status:
            status === 'requested' ? AssignmentStatus.Requested : 'rejected',
        });
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching translation requests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, [status]);

  // Reset success states only when user actually changes tabs (not during data refetch)
  useEffect(() => {
    // Skip on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      previousStatusRef.current = status;
      return;
    }

    // Only reset if status actually changed from user action
    if (previousStatusRef.current !== status) {
      setIsAccepted(false);
      setIsRejected(false);
      setErrorMessage(null);
      setRejectionReason('');
      // Close any open modals when switching tabs
      setIsAcceptModalOpen(false);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      // Don't reset success modal - it should only be closed by user action
      // setShowSuccessModal(false);
      // setSuccessMessage('');

      // Update the ref
      previousStatusRef.current = status;
    }
  }, [status]);

  // Filter requests based on search query
  const filteredRequests = useMemo(() => {
    if (!requests || !searchQuery.trim()) {
      return requests || [];
    }

    const query = searchQuery.toLowerCase().trim();
    return requests.filter((request: TranslationRequest) => {
      const languageName = getLanguageName(request.language).toLowerCase();
      return (
        request.assigneeUsername.toLowerCase().includes(query) ||
        request.courseName.toLowerCase().includes(query) ||
        request.courseIndex.toLowerCase().includes(query) ||
        request.language.toLowerCase().includes(query) ||
        languageName.includes(query)
      );
    });
  }, [requests, searchQuery]);

  // Function to update assignment status using trpcClient
  const updateAssignmentStatus = async (
    assignmentId: string,
    status: string,
    rejectionReason?: string,
  ) => {
    try {
      // @ts-ignore - translations router should be available
      return await trpcClient.content.updateTranslationAssignmentStatus.mutate({
        assignmentId,
        status,
        rejectionReason,
      });
    } catch (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }
  };

  const handleAccept = async (requestId: string) => {
    const request = filteredRequests?.find((req) => req.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setErrorMessage(null);
      // Reset success states when opening modal
      setIsAccepted(false);
      setIsRejected(false);
      setIsAcceptModalOpen(true);
    }
  };

  const handleReject = async (requestId: string) => {
    const request = filteredRequests?.find((req) => req.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setErrorMessage(null);
      // Reset success states when opening modal
      setIsAccepted(false);
      setIsRejected(false);
      setIsRejectModalOpen(true);
    }
  };

  const handleCloseAcceptModal = () => {
    setIsAcceptModalOpen(false);
    // Reset states when modal is closed
    setTimeout(() => {
      setSelectedRequest(null);
      setIsAccepting(false);
      setIsAccepted(false);
      setErrorMessage(null);
      // Refresh data if the request was accepted
      if (isAccepted) {
        refetch();
      }
    }, 300); // Small delay to allow modal close animation
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    // Reset states when modal is closed
    setTimeout(() => {
      setSelectedRequest(null);
      setIsRejecting(false);
      setIsRejected(false);
      setRejectionReason('');
      setErrorMessage(null);
    }, 300); // Small delay to allow modal close animation
  };

  const handleConfirmAccept = async () => {
    if (!selectedRequest || isAccepting || isAccepted) return;

    setIsAccepting(true);
    setErrorMessage(null);
    setProcessingRequests((prev) => new Set(prev).add(selectedRequest.id));

    try {
      await updateAssignmentStatus(
        selectedRequest.id,
        AssignmentStatus.Assigned,
      );
      setIsAccepted(true);
      // Note: Data will refresh when user switches tabs or manually refreshes
    } catch (error: any) {
      console.error('Error accepting request:', error);
      setErrorMessage(error.message || 'Failed to accept the request');
    } finally {
      setIsAccepting(false);
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
    }
  };

  const handleConfirmReject = async () => {
    if (
      !selectedRequest ||
      isRejecting ||
      isRejected ||
      !rejectionReason.trim()
    )
      return;

    setIsRejecting(true);
    setErrorMessage(null);
    setProcessingRequests((prev) => new Set(prev).add(selectedRequest.id));

    try {
      await updateAssignmentStatus(
        selectedRequest.id,
        'rejected',
        rejectionReason.trim(),
      );
      setIsRejected(true);
      // Show independent success modal
      setShowSuccessModal(true);
      setSuccessMessage('Request rejected successfully');
      // Close the main reject modal
      setIsRejectModalOpen(false);
      // Note: Data will refresh when user switches tabs or manually refreshes
    } catch (error: any) {
      console.error('❌ Error rejecting request:', error);
      setErrorMessage(error.message || 'Failed to reject the request');
    } finally {
      setIsRejecting(false);
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequest.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (requestId: string) => {
    setProcessingRequests((prev) => new Set(prev).add(requestId));

    try {
      // For now, we'll use the same function with a different status
      // This might need to be updated based on the actual API implementation
      await updateAssignmentStatus(requestId, 'deleted');
      // Refetch data after deletion
      refetch();
    } catch (error: any) {
      console.error('Error deleting request:', error);
    } finally {
      setProcessingRequests((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!filteredRequests || filteredRequests.length === 0) {
    const messageKey = searchQuery.trim()
      ? status === 'requested'
        ? 'dashboard.adminPanel.translationPanel.messages.noPendingRequestsSearch'
        : 'dashboard.adminPanel.translationPanel.messages.noRejectedRequestsSearch'
      : status === 'requested'
        ? 'dashboard.adminPanel.translationPanel.messages.noPendingRequests'
        : 'dashboard.adminPanel.translationPanel.messages.noRejectedRequests';

    const message = searchQuery.trim()
      ? t(messageKey, { query: searchQuery })
      : t(messageKey);

    return <div className="text-center py-8 text-gray-500">{message}</div>;
  }

  return (
    <>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="font-semibold text-gray-900 py-3">
                {t('dashboard.adminPanel.translationPanel.table.username')}
              </TableHead>
              <TableHead className="font-semibold text-gray-900 py-3 w-24">
                {t('dashboard.adminPanel.translationPanel.table.index')}
              </TableHead>
              <TableHead className="font-semibold text-gray-900 py-3">
                {t('dashboard.adminPanel.translationPanel.table.course')}
              </TableHead>
              <TableHead className="font-semibold text-gray-900 py-3">
                {t('dashboard.adminPanel.translationPanel.table.language')}
              </TableHead>
              <TableHead className="font-semibold text-gray-900 py-3 text-center">
                {t('dashboard.adminPanel.translationPanel.table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request: TranslationRequest) => {
              const isProcessing = processingRequests.has(request.id);

              return (
                <TableRow
                  key={request.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell className="py-4 font-medium text-gray-900">
                    {request.assigneeUsername}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
                      {request.courseIndex}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {request.courseName}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {getLanguageName(request.language)}
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      {status === 'requested' ? (
                        // For pending requests: Reject + Accept
                        <>
                          <Button
                            size="s"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          >
                            {isProcessing ? (
                              <Loader size="s" />
                            ) : (
                              t(
                                'dashboard.adminPanel.translationPanel.actions.reject',
                              )
                            )}
                          </Button>
                          <Button
                            size="s"
                            onClick={() => handleAccept(request.id)}
                            disabled={isProcessing}
                            className="bg-newOrange-1 hover:bg-newOrange-2 text-white border-newOrange-1"
                          >
                            {isProcessing ? (
                              <Loader size="s" />
                            ) : (
                              t(
                                'dashboard.adminPanel.translationPanel.actions.accept',
                              )
                            )}
                          </Button>
                        </>
                      ) : (
                        // For rejected requests: Delete + Accept
                        <>
                          <Button
                            size="s"
                            variant="outline"
                            onClick={() => handleDelete(request.id)}
                            disabled={isProcessing}
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 flex items-center gap-2"
                          >
                            {isProcessing ? (
                              <Loader size="s" />
                            ) : (
                              <>
                                <FaRegTrashAlt />
                                {t(
                                  'dashboard.adminPanel.translationPanel.actions.delete',
                                )}
                              </>
                            )}
                          </Button>
                          <Button
                            size="s"
                            onClick={() => handleAccept(request.id)}
                            disabled={isProcessing}
                            className="bg-newOrange-1 hover:bg-newOrange-2 text-white border-newOrange-1"
                          >
                            {isProcessing ? (
                              <Loader size="s" />
                            ) : (
                              t(
                                'dashboard.adminPanel.translationPanel.actions.accept',
                              )
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Accept Translation Request Modal - Simplified */}
      {isAcceptModalOpen && selectedRequest && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={handleCloseAcceptModal}
            >
              ×
            </button>

            {/* Logo and content */}
            <div className="flex flex-col items-center">
              <img
                src={PlanBLogoBlack}
                alt="Plan B Network"
                className="h-8 mb-6"
              />

              {isAccepted ? (
                <>
                  <h2 className="text-orange-500 text-lg font-medium mb-6 text-center">
                    {t(
                      'dashboard.adminPanel.translationPanel.modal.requestAcceptedSuccess',
                    )}
                  </h2>

                  <div className="text-orange-500 text-4xl mb-6">
                    <HiOutlineViewGrid />
                  </div>

                  <button
                    type="button"
                    className="px-6 py-2 border border-orange-500 text-orange-500 rounded hover:bg-orange-50 transition-colors"
                    onClick={handleCloseAcceptModal}
                  >
                    {t('dashboard.adminPanel.translationPanel.modal.close')}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-orange-500 text-lg font-medium mb-6 text-center">
                    {t(
                      'dashboard.adminPanel.translationPanel.modal.doYouWantToAcceptRequest',
                    )}
                  </h2>

                  <div className="text-orange-500 text-4xl mb-6">
                    <HiOutlineViewGrid />
                  </div>

                  {/* Error message */}
                  {errorMessage && (
                    <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      onClick={handleCloseAcceptModal}
                      disabled={isAccepting}
                    >
                      {t('dashboard.adminPanel.translationPanel.modal.cancel')}
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleConfirmAccept}
                      disabled={isAccepting}
                    >
                      {isAccepting
                        ? t(
                            'dashboard.adminPanel.translationPanel.modal.accepting',
                          )
                        : t(
                            'dashboard.adminPanel.translationPanel.modal.acceptRequest',
                          )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Translation Request Modal */}
      {isRejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={handleCloseRejectModal}
            >
              ×
            </button>

            {/* Logo and content */}
            <div className="flex flex-col items-center">
              <img
                src={PlanBLogoBlack}
                alt="Plan B Network"
                className="h-8 mb-6"
              />

              {isRejected ? (
                <>
                  <h2 className="text-orange-500 text-lg font-medium mb-6 text-center">
                    {t(
                      'dashboard.adminPanel.translationPanel.modal.requestRejectedSuccess',
                    )}
                  </h2>

                  <div className="text-orange-500 text-4xl mb-6">
                    <HiOutlineChatAlt2 />
                  </div>

                  <button
                    type="button"
                    className="px-6 py-2 border border-orange-500 text-orange-500 rounded hover:bg-orange-50 transition-colors"
                    onClick={handleCloseRejectModal}
                  >
                    {t('dashboard.adminPanel.translationPanel.modal.close')}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-orange-500 text-lg font-medium mb-6 text-center">
                    {t(
                      'dashboard.adminPanel.translationPanel.modal.provideRejectionReason',
                    )}
                  </h2>

                  <div className="text-orange-500 text-4xl mb-6">
                    <HiOutlineChatAlt2 />
                  </div>

                  {/* Error message */}
                  {errorMessage && (
                    <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  {/* Reason input */}
                  <div className="w-full mb-6">
                    <label
                      htmlFor="rejectionReason"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t(
                        'dashboard.adminPanel.translationPanel.modal.reasonForRejection',
                      )}
                      :
                    </label>
                    <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={t(
                        'dashboard.adminPanel.translationPanel.modal.reasonPlaceholder',
                      )}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {rejectionReason.length}/500
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                      onClick={handleCloseRejectModal}
                      disabled={isRejecting}
                    >
                      {t('dashboard.adminPanel.translationPanel.modal.cancel')}
                    </button>
                    <button
                      type="button"
                      className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleConfirmReject}
                      disabled={isRejecting || !rejectionReason.trim()}
                    >
                      {isRejecting
                        ? t(
                            'dashboard.adminPanel.translationPanel.modal.rejecting',
                          )
                        : t(
                            'dashboard.adminPanel.translationPanel.modal.submitRejection',
                          )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Independent Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowSuccessModal(false);
                setSuccessMessage('');
                // Refresh data when user closes the success modal
                refetch();
              }}
            >
              ×
            </button>

            {/* Logo and content */}
            <div className="flex flex-col items-center">
              <img
                src={PlanBLogoBlack}
                alt="Plan B Network"
                className="h-8 mb-6"
              />

              <h2 className="text-orange-500 text-lg font-medium mb-6 text-center">
                {successMessage}
              </h2>

              <div className="text-orange-500 text-4xl mb-6">
                <HiOutlineChatAlt2 />
              </div>

              <button
                type="button"
                className="px-6 py-2 border border-orange-500 text-orange-500 rounded hover:bg-orange-50 transition-colors"
                onClick={() => {
                  setShowSuccessModal(false);
                  setSuccessMessage('');
                  // Refresh data when user closes the success modal
                  refetch();
                }}
              >
                {t('dashboard.adminPanel.translationPanel.modal.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
