import { Link, createFileRoute, redirect } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { DropdownMenu } from '../../-components/PublicCommunication/dropdown-menu.tsx';

import { legalTabs } from './-utils.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/legals/',
)({
  loader: () => {
    return redirect({
      to: '/public-communication/legals/contact',
      throw: false,
    });
  },
});

interface LegalTabsProps {
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
}

export function LegalInformation({
  activeSubTab,
  setActiveSubTab,
}: LegalTabsProps) {
  const { t } = useTranslation();

  const dropdownItems = legalTabs.map((tab) => ({
    name: t(tab.label),
    link: tab.href,
    onClick: () => setActiveSubTab(tab.id),
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
            className="lg:px-4 lg:py-3.5 lg:text-xl font-normal text-base py-2 px-2.5 transition-all duration-300 border-b-4"
            activeProps={{
              className: 'border-darkOrange-5 text-black font-bold',
            }}
            inactiveProps={{
              className: 'border-darkOrange-0 text-[#050A14] opacity-50',
            }}
            value={tab.id}
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
