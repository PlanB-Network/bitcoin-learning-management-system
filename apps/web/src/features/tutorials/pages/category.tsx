import { Tab } from '@headlessui/react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@sovereign-university/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { SITE_NAME } from '#src/utils/meta.js';

import { CategoryIcon } from '../../../components/CategoryIcon/index.tsx';
import { TutorialCard } from '../../../components/tutorial-card.tsx';
import { trpc } from '../../../utils/index.ts';
import { TutorialLayout } from '../layout.tsx';
import { TUTORIALS_CATEGORIES, extractSubCategories } from '../utils.tsx';

export const TutorialCategory = () => {
  const { t, i18n } = useTranslation();
  const { category } = useParams({
    from: '/tutorials/$category',
  });

  const navigate = useNavigate();

  const tutorialCategory = TUTORIALS_CATEGORIES.find(
    (c) => c.name === category,
  );

  const [subCategories, setSubCategories] = useState<string[]>([]);

  const { data: tutorials, isFetched } =
    trpc.content.getTutorialsByCategory.useQuery({
      category,
      language: i18n.language,
    });

  useEffect(() => {
    if (!tutorialCategory) {
      navigate({
        to: '/tutorials',
      });
    }
  }, [tutorialCategory, navigate]);

  useEffect(() => {
    if (tutorials) {
      setSubCategories(extractSubCategories(tutorials).sort());
    }
  }, [tutorials]);

  return (
    <TutorialLayout currentCategory={category}>
      <PageMeta
        title={`${SITE_NAME} - ${capitalize(tutorialCategory!.name)}`}
        description={t(`tutorials.${category}.description`)}
      />
      <div className="mb-6 -mt-4 w-full max-w-5xl lg:hidden">
        <span className=" mb-2 w-full text-left text-lg font-normal leading-6 text-orange-500">
          <Link to="/tutorials">{t('words.tutorials') + ` > `}</Link>
          <span className="capitalize">{tutorialCategory!.name}</span>
        </span>
      </div>

      <div className="col-span-3 md:space-y-4 lg:max-w-3xl xl:col-span-2 xl:max-w-none">
        <div className="flex w-full flex-row items-center justify-start">
          <CategoryIcon
            src={tutorialCategory!.image}
            className="size-20 md:size-24"
          />
          <h1 className="py-3 pl-4 text-5xl font-extrabold uppercase text-orange-500 md:pl-6 lg:text-6xl">
            {tutorialCategory!.name}
          </h1>
        </div>
        <p className="hidden w-full text-justify leading-5 text-blue-800 md:flex md:text-left">
          {t(`tutorials.${category}.description`)}
        </p>
        {!isFetched && <Spinner className="size-48 md:size-64 mx-auto" />}
        {tutorials && (
          <div className="w-full px-2 py-4 md:px-0">
            <Tab.Group>
              <Tab.List className="flex max-md:flex-wrap rounded-t-xl bg-gray-200 overflow-hidden">
                {subCategories.map((subCategory, subCategoryIndex) => (
                  <div
                    key={subCategory}
                    className="max-md:flex flex-col items-center w-full overflow-hidden"
                  >
                    <Tab
                      className={({ selected }) =>
                        cn(
                          'w-fit md:w-full overflow-hidden px-3 py-2 max-md:my-3 md:px-2 md:py-4 font-medium capitalize max-md:rounded-lg focus:ring-0',
                          selected
                            ? 'bg-blue-800 text-white'
                            : 'text-blue-700 hover:bg-gray-100/[0.3] hover:text-orange-600',
                        )
                      }
                    >
                      {t([
                        `tutorials.${category}.${subCategory}.name`,
                        subCategory,
                      ])}
                    </Tab>
                    <div
                      className={cn(
                        'h-px w-20 bg-blue-800 rounded-full mx-auto',
                        subCategoryIndex < subCategories.length - 1
                          ? 'md:hidden'
                          : 'hidden',
                      )}
                    />
                  </div>
                ))}
              </Tab.List>
              <Tab.Panels className="rounded-b-xl bg-gray-200 pb-8">
                {subCategories.map((subCategory) => (
                  <Tab.Panel key={subCategory}>
                    <div className="flex flex-col px-3 md:px-10 pt-3 gap-8">
                      {i18n.exists(
                        `tutorials.${category}.${subCategory}.description`,
                      ) && (
                        <div className="hidden pt-3 text-sm font-light italic text-blue-900 md:flex">
                          {t(
                            `tutorials.${category}.${subCategory}.description`,
                          )}
                        </div>
                      )}
                      <div className="flex flex-col space-y-4">
                        {tutorials
                          .filter(
                            (tutorial) => tutorial.subcategory === subCategory,
                          )
                          .map((tutorial) => (
                            <TutorialCard
                              key={tutorial.id}
                              tutorial={tutorial}
                            />
                          ))}
                      </div>
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </TutorialLayout>
  );
};
