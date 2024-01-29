import { Tab } from '@headlessui/react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryIcon } from '../../../components/CategoryIcon';
import { TutorialCard } from '../../../components/tutorial-card';
import { compose, trpc } from '../../../utils';
import { TutorialLayout } from '../layout';
import { TUTORIALS_CATEGORIES, extractSubCategories } from '../utils';

export const TutorialCategory = () => {
  const { t, i18n } = useTranslation();
  const { category } = useParams({
    from: '/tutorials/$category',
  });
  const navigate = useNavigate();

  const [subCategories, setSubCategories] = useState<string[]>([]);

  const tutorialCategory = TUTORIALS_CATEGORIES.find(
    (c) => c.name === category,
  ) as (typeof TUTORIALS_CATEGORIES)[0];

  const { data: tutorials } = trpc.content.getTutorialsByCategory.useQuery({
    category,
    language: i18n.language,
  });

  useEffect(() => {
    if (!TUTORIALS_CATEGORIES.some((c) => c.name === category)) {
      navigate({
        to: '/tutorials',
      });
    }
  }, [category, navigate]);

  useEffect(() => {
    if (tutorials) {
      setSubCategories(extractSubCategories(tutorials).sort());
    }
  }, [tutorials]);

  return (
    <TutorialLayout currentCategory={category}>
      <div className="mb-6 mt-[-1rem] w-full max-w-5xl lg:hidden">
        <span className=" mb-2 w-full text-left text-lg font-normal leading-6 text-orange-500">
          <Link to="/tutorials">{t('words.tutorials') + ` > `}</Link>
          <span className="capitalize">{tutorialCategory.name}</span>
        </span>
      </div>

      <div className="col-span-3 md:space-y-4 lg:max-w-3xl xl:col-span-2 xl:max-w-none">
        <div className="flex w-full flex-row items-center justify-start">
          <CategoryIcon
            src={tutorialCategory.image}
            className="h-20 w-20 md:h-24 md:w-24"
          />
          <h1 className="py-3 pl-4 text-5xl font-extrabold uppercase text-orange-500 md:pl-6 lg:text-6xl">
            {tutorialCategory.name}
          </h1>
        </div>
        <p className="hidden w-full text-justify leading-5 text-blue-800 md:flex md:text-left">
          {t(`tutorials.${category}.description`)}
        </p>
        {tutorials && (
          <div className="w-full px-2 py-4 sm:px-0">
            <Tab.Group>
              <Tab.List className="flex rounded-t-xl bg-gray-200">
                {subCategories.map((subCategory) => (
                  <Tab
                    key={subCategory}
                    className={({ selected }) =>
                      compose(
                        'w-full first:rounded-tl-xl last:rounded-tr-xl py-4 font-medium text-blue-800 capitalize',
                        selected
                          ? 'bg-blue-800 text-white shadow'
                          : 'text-blue-100 hover:bg-gray-100/[0.3] hover:text-orange-600',
                      )
                    }
                  >
                    {t([
                      `tutorials.${category}.${subCategory}.name`,
                      subCategory,
                    ])}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="rounded-b-xl bg-gray-200 pb-8">
                {subCategories.map((subCategory) => (
                  <Tab.Panel key={subCategory}>
                    <div className="flex flex-col space-y-8 px-10 md:pt-3">
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
