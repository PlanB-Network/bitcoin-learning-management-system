import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@blms/ui';

import { DropdownMenu } from '../-components/PublicCommunication/dropdown-menu.tsx';

import Layout from './-layout.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legals',
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
    <Layout>
      <LegalInformation
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />
      <div className="max-w-[1140px] flex flex-col lg:justify-start text-start">
        <Outlet />
      </div>
    </Layout>
  );
}

const legalTabs = [
  {
    id: 'contact',
    label: 'publicCommunication.legalSections.contact',
    href: '/public-communication/legals/contact',
  },
  {
    id: 'legal-notice',
    label: 'publicCommunication.legalSections.legalNotice',
    href: '/public-communication/legals/legal-notice',
  },
  {
    id: 'privacy-policy',
    label: 'publicCommunication.legalSections.privacyPolicy',
    href: '/public-communication/legals/privacy-policy',
  },
  {
    id: 'terms-of-sale',
    label: 'publicCommunication.legalSections.termsOfSale',
    href: '/public-communication/legals/terms-of-sale',
  },
];

interface LegalTabsProps {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}

function LegalInformation({ activeSubTab, setActiveSubTab }: LegalTabsProps) {
  const { t } = useTranslation();

  const dropdownItems = legalTabs.map((tab) => ({
    id: tab.id,
    name: t(tab.label),
    link: tab.href,
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
                : 'text-[#050A14] border-darkOrange-0 opacity-50',
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
