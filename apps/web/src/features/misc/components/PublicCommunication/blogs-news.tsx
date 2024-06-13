import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { blogList as data } from '#src/features/misc/components/PublicCommunication/data.ts';

import { BlogList } from './blog-list.tsx';

const blogTabs = [
  {
    id: 'all',
    label: 'publicCommunication.blogcategories.all',
  },
  {
    id: 'course',
    label: 'publicCommunication.blogcategories.course',
  },
  {
    id: 'features',
    label: 'publicCommunication.blogcategories.features',
  },
  {
    id: 'patch',
    label: 'publicCommunication.blogcategories.patch',
  },
  {
    id: 'grants',
    label: 'publicCommunication.blogcategories.grants',
  },
  {
    id: 'network',
    label: 'publicCommunication.blogcategories.network',
  },
];

export const BlogsNews = () => {
  const { t } = useTranslation();
  const [selectedMainTab, setSelectedMainTab] = useState(blogTabs[0].id);

  const handleMainTabChange = (value: string) => {
    setSelectedMainTab(value);
  };

  return (
    <Tabs.Root
      className="TabsRoot"
      value={selectedMainTab}
      onValueChange={handleMainTabChange}
    >
      {/* Desktop Tabs */}
      <Tabs.List
        className="TabsList hidden lg:flex flex-row justify-center mx-auto lg:pb-[57px] lg:mt-[27px] space-x-[21px] transition-all duration-300"
        aria-label="Manage your account"
        role="tablist"
      >
        {blogTabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            className={`TabsTrigger lg:px-[18px] lg:py-[14px] lg:text-xl lg:leading-[24px] font-normal text-[16px] leading-[16px] py-[7px] px-[10px] transition-all duration-300 border-b-4 ${
              selectedMainTab === tab.id
                ? 'border-darkOrange-5 text-black font-bold'
                : 'border-darkOrange-0 text-[#050A14] opacity-50'
            }`}
            value={tab.id}
            role="tab"
            onClick={() => setSelectedMainTab(tab.id)}
          >
            {t(tab.label)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Mobile Select */}
      <div className="flex justify-center mx-auto lg:hidden mb-4">
        <select
          className="w-full max-w-[290px] p-2 border border-darkOrange-5 text-black font-medium focus:border-darkOrange-5 focus:outline-none active:border-darkOrange-5 bg-transparent rounded-md"
          value={selectedMainTab}
          onChange={(e) => setSelectedMainTab(e.target.value)}
        >
          {blogTabs.map((tab) => (
            <option
              key={tab.id}
              value={tab.id}
              className={
                selectedMainTab === tab.id
                  ? 'font-medium text-black'
                  : 'font-normal text-black'
              }
            >
              {t(tab.label)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-row text-center lg:justify-start lg:text-start space-x-[21px]">
        <BlogList
          blogList={data.content.filter(
            (blog) =>
              blog.category === selectedMainTab || selectedMainTab === 'all',
          )}
        />
      </div>
    </Tabs.Root>
  );
};
