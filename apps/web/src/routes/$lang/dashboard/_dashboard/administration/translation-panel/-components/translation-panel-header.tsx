import { Tabs, TabsList, TabsTrigger, TextTag } from '@blms/ui';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useSmaller } from '#src/hooks/use-smaller.ts';

interface TranslationPanelHeaderProps {
  activeTab?: 'requests' | 'content' | 'users' | 'reports';
  showTabs?: boolean;
  children?: React.ReactNode;
  isUserDetailsPage?: boolean;
}

export const TranslationPanelHeader = ({
  activeTab = 'requests',
  showTabs = true,
  children,
  isUserDetailsPage = false,
}: TranslationPanelHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isTablet = useSmaller('lg');
  const isMobile = useSmaller('md');

  const handleTabChange = (tab: string) => {
    // Navigate to the main translation panel with the selected tab
    navigate({
      to: '/$lang/dashboard/administration/translation-panel',
      search: { tab },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex max-lg:flex-col lg:items-center gap-2 lg:gap-5">
        <h1 className="display-small-32px">
          {t('dashboard.adminPanel.translationPanel.title')}
        </h1>
        <TextTag
          size={isTablet ? 'verySmall' : 'small'}
          className="uppercase w-fit bg-newOrange-1 text-white"
        >
          {t('dashboard.adminPanel.translationPanel.admin')}
        </TextTag>
      </div>

      {/* Main Tabs */}
      {showTabs && isUserDetailsPage && (
        // Tab navigation for user details page with same style as main page
        <div className="w-full">
          <div
            className={`items-center bg-transparent text-newBlack-3 dark:text-newGray-4 overflow-x-scroll no-scrollbar flex max-w-full ${isMobile ? 'gap-[18px]' : 'gap-6'}`}
          >
            <button
              type="button"
              onClick={() => handleTabChange('requests')}
              className={`data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-color focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-black ${isMobile ? 'label-medium-16px pb-2' : 'label-18px pb-2.5'} ${
                activeTab === 'requests'
                  ? 'font-medium text-black border-b-2 border-darkOrange-5'
                  : 'text-newBlack-3 hover:border-b-2 hover:border-newGray-4'
              }`}
            >
              {t('dashboard.adminPanel.translationPanel.tabs.requests')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('content')}
              className={`data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-color focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-black ${isMobile ? 'label-medium-16px pb-2' : 'label-18px pb-2.5'} ${
                activeTab === 'content'
                  ? 'font-medium text-black border-b-2 border-darkOrange-5'
                  : 'text-newBlack-3 hover:border-b-2 hover:border-newGray-4'
              }`}
            >
              {t(
                'dashboard.adminPanel.translationPanel.tabs.contentManagement',
              )}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('users')}
              className={`data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-color focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-black ${isMobile ? 'label-medium-16px pb-2' : 'label-18px pb-2.5'} ${
                activeTab === 'users'
                  ? 'font-medium text-black border-b-2 border-darkOrange-5'
                  : 'text-newBlack-3 hover:border-b-2 hover:border-newGray-4'
              }`}
            >
              {t('dashboard.adminPanel.translationPanel.tabs.userManagement')}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('reports')}
              className={`data-[state=active]:font-medium inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-color focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-black ${isMobile ? 'label-medium-16px pb-2' : 'label-18px pb-2.5'} ${
                activeTab === 'reports'
                  ? 'font-medium text-black border-b-2 border-darkOrange-5'
                  : 'text-newBlack-3 hover:border-b-2 hover:border-newGray-4'
              }`}
            >
              {t('dashboard.adminPanel.translationPanel.tabs.reports')}
            </button>
          </div>
          {children}
        </div>
      )}

      {/* Full Tabs component for main page */}
      {showTabs && !isUserDetailsPage && (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList
            size={isMobile ? 's' : 'm'}
            className="w-full justify-start"
          >
            <TabsTrigger value="requests" size={isMobile ? 's' : 'm'}>
              {t('dashboard.adminPanel.translationPanel.tabs.requests')}
            </TabsTrigger>
            <TabsTrigger value="content" size={isMobile ? 's' : 'm'}>
              {t(
                'dashboard.adminPanel.translationPanel.tabs.contentManagement',
              )}
            </TabsTrigger>
            <TabsTrigger value="users" size={isMobile ? 's' : 'm'}>
              {t('dashboard.adminPanel.translationPanel.tabs.userManagement')}
            </TabsTrigger>
            <TabsTrigger value="reports" size={isMobile ? 's' : 'm'}>
              {t('dashboard.adminPanel.translationPanel.tabs.reports')}
            </TabsTrigger>
          </TabsList>
          {children}
        </Tabs>
      )}

      {/* Content when tabs are disabled */}
      {!showTabs && children}
    </div>
  );
};
