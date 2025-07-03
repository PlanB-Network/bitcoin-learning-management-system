import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { BlogList } from '../../-components/public-communication/blog-list.tsx';
import { DropdownMenu } from '../../-components/public-communication/dropdown-menu.tsx';
import { blogTabs } from '../../-components/utils/public-communication-utils.tsx';
import BlogsAndNewsLayout from '../-layout.tsx';

export const Route = createFileRoute(
  '/$lang/_content/_misc/public-communication/blogs-and-news/$category',
)({
  component: BlogsCategory,
  params: {
    parse: (params) => ({
      category: z.string().parse(params.category),
      lang: z.string().parse(params.lang),
    }),
    stringify: ({ lang, category }) => ({
      category: `${category}`,
      lang: lang,
    }),
  },
});

function BlogsCategory() {
  const { t } = useTranslation();
  const params = Route.useParams();

  const [selectedMainTab, setSelectedMainTab] = useState(
    params.category || blogTabs[0].id,
  );

  useEffect(() => {
    if (params.category && selectedMainTab !== params.category) {
      setSelectedMainTab(params.category);
    }
  }, [params.category, selectedMainTab]);

  const handleMainTabChange = (id: string) => {
    setSelectedMainTab(id);
  };

  const dropdownItems = blogTabs.map((tab) => ({
    link: tab.href,
    name: t(tab.label),
    onClick: () => handleMainTabChange(tab.id),
  }));

  const activeItem = dropdownItems.find(
    (item) =>
      item.name ===
      t(blogTabs.find((tab) => tab.id === selectedMainTab)?.label ?? ''),
  );

  return (
    <BlogsAndNewsLayout>
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
        <div className="flex lg:hidden md:mb-3 w-full">
          <DropdownMenu
            activeItem={activeItem ? activeItem.name : ''}
            itemsList={dropdownItems}
            variant="gray"
          />
        </div>
      </div>

      <div className="flex flex-row text-center lg:justify-start lg:text-start space-x-5 mt-5">
        <BlogList category={selectedMainTab} />
      </div>
    </BlogsAndNewsLayout>
  );
}

export default BlogsCategory;
