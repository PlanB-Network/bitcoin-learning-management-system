import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Layout from '../-layout.tsx';
import { BlogList } from '../../-components/public-communication/blog-list.tsx';
import { DropdownMenu } from '../../-components/public-communication/dropdown-menu.tsx';

export const Route = createFileRoute(
  '/_content/_misc/public-communication/blogs-and-news/',
)({
  component: BlogsNews,
});

const blogTabs = [
  {
    id: 'all',
    label: 'publicCommunication.blogCategories.all',
    href: '/public-communication/blogs-and-news/',
  },
  {
    id: 'content',
    label: 'publicCommunication.blogCategories.content',
    href: '/public-communication/blogs-and-news/content',
  },
  {
    id: 'feature',
    label: 'publicCommunication.blogCategories.feature',
    href: '/public-communication/blogs-and-news/feature',
  },
  {
    id: 'network',
    label: 'publicCommunication.blogCategories.network',
    href: '/public-communication/blogs-and-news/network',
  },
];

function BlogsNews() {
  const { t } = useTranslation();
  const [selectedMainTab, setSelectedMainTab] = useState(blogTabs[0].id);

  const handleMainTabChange = (id: string) => {
    setSelectedMainTab(id);
  };

  const dropdownItems = blogTabs.map((tab) => ({
    name: t(tab.label),
    link: tab.href,
    onClick: () => handleMainTabChange(tab.id),
  }));

  const activeItem = dropdownItems.find(
    (item) =>
      item.name ===
      t(blogTabs.find((tab) => tab.id === selectedMainTab)?.label ?? ''),
  );

  return (
    <Layout>
      <div className="flex flex-row mx-auto justify-center lg:pb-14 lg:mt-7 lg:space-x-5 transition-all mb-6 duration-300">
        {/* Desktop view */}
        <div className="hidden lg:flex space-x-5">
          {blogTabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.href}
              className={`lg:px-4 lg:py-3.5 lg:text-xl font-normal text-base py-2 px-2.5 transition-all duration-300 border-b-4 ${
                selectedMainTab === tab.id
                  ? 'border-darkOrange-5 text-black font-bold'
                  : 'border-darkOrange-0 text-dashboardSectionText opacity-50'
              }`}
              onClick={() => handleMainTabChange(tab.id)}
            >
              {t(tab.label)}
            </Link>
          ))}
        </div>

        {/* Mobile view */}
        <div className="mb-5 lg:hidden max-w-[280px] mx-auto w-full">
          <DropdownMenu
            activeItem={activeItem ? activeItem.name : ''}
            itemsList={dropdownItems}
            variant="gray"
          />
        </div>
      </div>
      {/* Blog List */}
      <div className="flex flex-row text-center lg:justify-start lg:text-start space-x-5 mt-5">
        <BlogList category={selectedMainTab} />
      </div>
    </Layout>
  );
}
