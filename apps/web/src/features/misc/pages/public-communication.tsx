import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageLayout } from '#src/components/PageLayout/index.tsx';
import { BlogsNews } from '#src/features/misc/components/PublicCommunication/blogs-news.tsx';
import { LegalInformation } from '#src/features/misc/components/PublicCommunication/legal-information.tsx';

const mainTabs = [
  {
    id: 'tab1',
    label: 'publicCommunication.blogpost',
    component: BlogsNews,
  },
  {
    id: 'tab2',
    label: 'publicCommunication.legal',
    component: LegalInformation,
  },
];

export const PublicCommunicationPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <PageLayout
      variant="light"
      footerVariant="light"
      title={t('publicCommunication.title')}
      description={t('publicCommunication.description')}
    >
      <Tabs.Root defaultValue="tab1" onValueChange={setActiveTab}>
        <Tabs.List
          className="flex flex-row mx-auto justify-center lg:pb-[57px] lg:mt-[27px] border-0 lg:border-b-2 space-x-[21px] transition-all duration-300"
          aria-label="Manage your account"
          role="tablist"
        >
          {mainTabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              className={`lg:px-[18px] lg:py-[14px] lg:text-xl lg:leading-[24px] font-normal lg:!font-medium rounded-2xl text-[16px] leading-[16px] py-[7px] px-[10px] transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-darkOrange-5 text-white scale-95'
                  : 'text-darkOrange-5 border bg-transparent border-darkOrange-5'
              }`}
              value={tab.id}
              role="tab"
              onClick={() => setActiveTab(tab.id)}
            >
              {t(tab.label)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {mainTabs.map((tab) => (
          <Tabs.Content
            key={tab.id}
            className="mb-[32px] pt-[32px] lg:pt-[40px] lg:mb-[40px]"
            value={tab.id}
            role="tabpanel"
            id={`${tab.id}-panel`}
            aria-labelledby={tab.id}
          >
            <div className="flex flex-row text center justify-center space-x-[21px]">
              {tab.component()}
            </div>

            {/* Subtab Content */}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </PageLayout>
  );
};
