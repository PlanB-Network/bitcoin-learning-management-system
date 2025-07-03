import { cn } from '@blms/ui';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu } from '../-components/public-communication/dropdown-menu.tsx';
import { legalTabs } from '../-components/utils/public-communication-utils.tsx';

import BlogsAndNewsLayout from './-layout.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/public-communication/legals',
)({
  // loader: () => {
  //   return redirect({
  //     to: '/public-communication/legals/contact',
  //     throw: false,
  //   });
  // },
  component: LegalsLayout,
});

function LegalsLayout() {
  const [activeSubTab, setActiveSubTab] = useState('contact');

  const name = window.location.href.split('/').pop();

  useEffect(() => {
    const tab = legalTabs.find((tab) => tab.id === name);
    if (tab) {
      setActiveSubTab(tab.id);
    }
  }, [name]);

  return (
    <BlogsAndNewsLayout>
      <LegalInformation
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />
      <div className="max-w-[1140px] flex flex-col lg:justify-start text-start">
        <Outlet />
      </div>
    </BlogsAndNewsLayout>
  );
}

interface LegalTabsProps {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}

function LegalInformation({ activeSubTab, setActiveSubTab }: LegalTabsProps) {
  const { t } = useTranslation();

  const dropdownItems = legalTabs.map((tab) => ({
    id: tab.id,
    link: tab.href,
    name: t(tab.label),
    onClick: () => {
      setActiveSubTab(tab.id);
    },
  }));

  const activeItem = dropdownItems.find(
    (item) =>
      item.link === legalTabs.find((tab) => tab.id === activeSubTab)?.href,
  );

  return (
    <>
      <div
        className="TabsList hidden lg:flex flex-row justify-center mx-auto lg:pb-10 lg:mt-7 space-x-5 transition-all duration-300"
        aria-label="Legal navigation"
        role="tablist"
      >
        {legalTabs.map((tab) => (
          <Link
            to={tab.href}
            key={tab.id}
            className={cn(
              'lg:px-4 lg:py-3.5 lg:text-xl font-normal text-base py-2 px-2.5 transition-all duration-300 border-b-4',
              tab.id === activeItem?.id
                ? 'text-black border-darkOrange-5'
                : 'text-dashboardSectionText border-darkOrange-0 opacity-50',
            )}
            value={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id);
            }}
            role="tab"
          >
            {t(tab.label)}
          </Link>
        ))}
      </div>

      {/* Mobile Select */}
      <div className="mb-5 lg:hidden max-w-[280px] mx-auto">
        <div className="mb-2.5 text-start text-xs text-black font-medium">
          {t('publicCommunication.blogPageStrings.filterText')}
        </div>
        <DropdownMenu
          activeItem={activeItem ? activeItem.name : ''}
          itemsList={dropdownItems}
          variant="gray"
        />
      </div>
    </>
  );
}
