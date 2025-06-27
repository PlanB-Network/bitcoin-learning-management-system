import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineViewGrid } from 'react-icons/hi';

import CrossIcon from '#src/assets/icons/cross_red.svg';
import ProfileIcon from '#src/assets/icons/groups.svg';
import { CommonModal } from '#src/components/ui/common-modal.tsx';
import { trpcClient } from '#src/utils/trpc.js';

interface ContributorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface User {
  uid: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  role: string;
  assignedLanguages: string[] | null;
}

interface Language {
  code: string;
  name: string;
}

interface SelectedUser {
  user: User;
  languageCodes: string[];
}

export const ContributorAssignmentModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ContributorAssignmentModalProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAssigned, setIsAssigned] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // Fetch users when modal opens or search query changes
  const fetchUsers = async () => {
    try {
      const response = await trpcClient.user.translation.getAllUsers.query();
      setUsers(response as User[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrorMessage('Failed to fetch users');
    }
  };

  // Fetch languages when modal opens
  const fetchLanguages = async () => {
    try {
      const response =
        await trpcClient.user.translation.getAvailableLanguages.query();
      setLanguages(response);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setErrorMessage('Failed to fetch languages');
    }
  };

  // Initialize data when modal opens
  const initializeModal = () => {
    if (isOpen && !isAssigned) {
      fetchUsers();
      fetchLanguages();
      setSearchQuery('');
      setSelectedUsers([]);
      setErrorMessage('');
    }
  };

  // Call initializeModal when modal opens
  useEffect(() => {
    initializeModal();
  }, [isOpen]);

  const filteredUsers = users.filter(
    (user) =>
      !selectedUsers.some((su) => su.user.uid === user.uid) &&
      (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleUserSelect = (user: User) => {
    setSelectedUsers((prev) => [...prev, { user, languageCodes: [''] }]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleLanguageSelect = (
    userUid: string,
    languageIndex: number,
    languageCode: string,
  ) => {
    setSelectedUsers((prev) =>
      prev.map((su) => {
        if (su.user.uid === userUid) {
          const newLanguageCodes = [...su.languageCodes];
          newLanguageCodes[languageIndex] = languageCode;
          return { ...su, languageCodes: newLanguageCodes };
        }
        return su;
      }),
    );
  };

  const handleAddLanguage = (userUid: string) => {
    setSelectedUsers((prev) =>
      prev.map((su) => {
        if (su.user.uid === userUid) {
          return { ...su, languageCodes: [...su.languageCodes, ''] };
        }
        return su;
      }),
    );
  };

  const handleRemoveLanguage = (userUid: string, languageIndex: number) => {
    setSelectedUsers((prev) =>
      prev.map((su) => {
        if (su.user.uid === userUid) {
          const newLanguageCodes = su.languageCodes.filter(
            (_, index) => index !== languageIndex,
          );
          return {
            ...su,
            languageCodes:
              newLanguageCodes.length > 0 ? newLanguageCodes : [''],
          };
        }
        return su;
      }),
    );
  };

  const handleRemoveUser = (userUid: string) => {
    setSelectedUsers((prev) => prev.filter((su) => su.user.uid !== userUid));
  };

  const canConfirm =
    selectedUsers.length > 0 &&
    selectedUsers.every(
      (su) =>
        su.languageCodes.some((code) => code !== '') &&
        su.languageCodes.every(
          (code) => code !== '' || su.languageCodes.length === 1,
        ),
    );

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      for (const selectedUser of selectedUsers) {
        for (const languageCode of selectedUser.languageCodes) {
          if (languageCode) {
            // Only assign non-empty language codes
            await trpcClient.user.translation.assignLanguageToContributor.mutate(
              {
                contributorId: selectedUser.user.uid,
                languageCode: languageCode,
              },
            );
          }
        }
      }

      setIsAssigned(true);
    } catch (error: any) {
      console.error('Error assigning contributors:', error);
      setErrorMessage(error.message || 'Failed to assign contributors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isAssigned && onSuccess) {
      onSuccess();
    }
    setIsAssigned(false);
    setSelectedUsers([]);
    setSearchQuery('');
    setErrorMessage('');
    onClose();
  };

  const getUserDisplayName = (user: User) => {
    return user.displayName || user.username || user.email || 'Unknown User';
  };

  if (isAssigned) {
    return (
      <CommonModal
        isOpen={isOpen}
        onClose={handleClose}
        title={t(
          'dashboard.adminPanel.translationPanel.addContributor.assignmentSuccess',
        )}
        icon={<HiOutlineViewGrid />}
        maxWidth="max-w-2xl"
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
      title={t('dashboard.adminPanel.translationPanel.addContributor.title')}
      icon={<HiOutlineViewGrid />}
      errorMessage={errorMessage}
      maxWidth="max-w-2xl"
      actions={
        <>
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('dashboard.adminPanel.translationPanel.modal.cancel')}
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading
              ? t(
                  'dashboard.adminPanel.translationPanel.addContributor.assigning',
                )
              : t(
                  'dashboard.adminPanel.translationPanel.addContributor.confirm',
                )}
          </button>
        </>
      }
    >
      <div className="w-full space-y-4">
        {/* Find a contributor title */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t(
              'dashboard.adminPanel.translationPanel.addContributor.findContributor',
            )}
          </h3>

          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder={t(
                  'dashboard.adminPanel.translationPanel.addContributor.searchUsers',
                )}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1">
                <img src={ProfileIcon} alt="Search" className="w-5 h-5" />
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <button
                      key={user.uid}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="font-medium">
                        {getUserDisplayName(user)}
                      </div>
                      {user.email && (
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-center">
                    {t(
                      'dashboard.adminPanel.translationPanel.addContributor.noUsers',
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {t(
                'dashboard.adminPanel.translationPanel.addContributor.selectedUsers',
              )}
            </h3>
            {selectedUsers.map((selectedUser) => (
              <div
                key={selectedUser.user.uid}
                className="p-4 bg-gray-100 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <img
                      src={ProfileIcon}
                      alt="User"
                      className="w-6 h-6"
                      style={{ filter: 'brightness(0)' }}
                    />
                    <span className="font-medium text-black text-lg">
                      {getUserDisplayName(selectedUser.user)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveUser(selectedUser.user.uid)}
                    className="p-2 border-2 border-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    <img src={CrossIcon} alt="Remove" className="w-5 h-5" />
                  </button>
                </div>

                {/* Languages for this user */}
                <div className="space-y-2">
                  {selectedUser.languageCodes.map((languageCode, index) => (
                    <div
                      key={`${selectedUser.user.uid}-${index}`}
                      className="flex items-center space-x-2"
                    >
                      <select
                        value={languageCode}
                        onChange={(e) =>
                          handleLanguageSelect(
                            selectedUser.user.uid,
                            index,
                            e.target.value,
                          )
                        }
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-w-[150px] flex-1"
                        style={{
                          color: languageCode ? '#f97316' : '#6b7280',
                        }}
                      >
                        <option value="" className="text-gray-500">
                          {t(
                            'dashboard.adminPanel.translationPanel.addContributor.selectLanguage',
                          )}
                        </option>
                        {languages
                          .filter(
                            (language) =>
                              !selectedUser.user.assignedLanguages?.includes(
                                language.code,
                              ) &&
                              !selectedUser.languageCodes
                                .filter((_, i) => i !== index)
                                .includes(language.code),
                          )
                          .map((language) => (
                            <option
                              key={language.code}
                              value={language.code}
                              className="text-orange-500"
                            >
                              {language.name}
                            </option>
                          ))}
                      </select>

                      {selectedUser.languageCodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveLanguage(selectedUser.user.uid, index)
                          }
                          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <img
                            src={CrossIcon}
                            alt="Remove Language"
                            className="w-4 h-4"
                          />
                        </button>
                      )}

                      {index === selectedUser.languageCodes.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleAddLanguage(selectedUser.user.uid)
                          }
                          className="p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                          title={t(
                            'dashboard.adminPanel.translationPanel.addContributor.addLanguage',
                          )}
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CommonModal>
  );
};
