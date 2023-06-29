import { Disclosure } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import { MainLayout } from '../../../components/MainLayout';
import { Routes } from '../../../types';
import { compose } from '../../../utils';
import { TUTORIALS_CATEGORIES, extractSubCategories } from '../utils';

export const TutorialLayout = ({
  children,
  currentCategory,
}: {
  children?: JSX.Element | JSX.Element[];
  currentCategory?: string;
}) => {
  const { t } = useTranslation();

  const { data: allTutorials } = trpc.content.getTutorials.useQuery({
    // Add once translations are available
    // language: i18n.language,
  });

  return (
    <MainLayout>
      <div className="grid h-max w-full grid-cols-4 items-start bg-gray-100 px-3 md:px-6">
        <div className="hidden w-full pr-10 pt-8 lg:block">
          <div className="w-full rounded-2xl bg-white p-2 drop-shadow">
            <h3 className="mx-2 mb-2 border-b-2 border-b-orange-600 py-1 text-lg font-semibold uppercase text-orange-600">
              Tutorials
            </h3>
            {allTutorials &&
              TUTORIALS_CATEGORIES.map((tutorialCategory) =>
                allTutorials.filter(
                  (tutorial) => tutorial.category === tutorialCategory.name
                ).length > 0 ? (
                  <Disclosure
                    key={tutorialCategory.name}
                    defaultOpen={tutorialCategory.name === currentCategory}
                  >
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-start space-x-3 rounded-lg px-5 py-2 text-left text-sm">
                          <BsFillTriangleFill
                            size={10}
                            className={
                              open
                                ? 'text-primary-700 rotate-180 align-middle'
                                : 'text-primary-600 rotate-90 align-middle'
                            }
                          />
                          <span
                            className={compose(
                              'text-primary-800 align-middle uppercase',
                              open ? 'font-bold' : ''
                            )}
                          >
                            {t([
                              `tutorials.${tutorialCategory.name}.name`,
                              tutorialCategory.name,
                            ])}
                          </span>
                        </Disclosure.Button>

                        <Disclosure.Panel className="px-4 text-sm text-gray-500">
                          {allTutorials &&
                            extractSubCategories(
                              allTutorials.filter(
                                (tutorial) =>
                                  tutorial.category === tutorialCategory.name
                              )
                            ).map((subCategory) => (
                              <Disclosure key={subCategory}>
                                {({ open }) => (
                                  <>
                                    <Disclosure.Button className="flex w-full items-center justify-start space-x-3 rounded-lg px-5 py-1 text-left text-sm">
                                      <BsFillTriangleFill
                                        size={8}
                                        className={
                                          open
                                            ? 'text-primary-700 rotate-180 align-middle'
                                            : 'text-primary-600 rotate-90 align-middle'
                                        }
                                      />
                                      <span
                                        className={compose(
                                          'text-primary-800 align-middle uppercase text-sm',
                                          open ? 'font-semibold' : ''
                                        )}
                                      >
                                        {t([
                                          `tutorials.${tutorialCategory.name}.${subCategory}.name`,
                                          subCategory,
                                        ])}
                                      </span>
                                    </Disclosure.Button>

                                    <Disclosure.Panel className="px-8 py-1 text-sm text-gray-500">
                                      <ul className="space-y-1">
                                        {allTutorials
                                          .filter(
                                            (tutorial) =>
                                              tutorial.category ===
                                                tutorialCategory.name &&
                                              tutorial.subcategory ===
                                                subCategory
                                          )
                                          .map((tutorial) => (
                                            <li
                                              key={tutorial.id}
                                              className={
                                                'group flex list-none items-center justify-start space-x-2'
                                              }
                                            >
                                              <BsFillCircleFill
                                                size={6}
                                                className="text-primary-600 group-hover:text-orange-600"
                                              />
                                              <Link
                                                to={generatePath(
                                                  Routes.Tutorial,
                                                  {
                                                    category: tutorial.category,
                                                    tutorialId:
                                                      tutorial.id.toString(),
                                                    language: tutorial.language,
                                                  }
                                                )}
                                                className="text-primary-800 text-sm group-hover:text-orange-800"
                                              >
                                                {t(tutorial.name)}
                                              </Link>
                                            </li>
                                          ))}
                                      </ul>
                                    </Disclosure.Panel>
                                  </>
                                )}
                              </Disclosure>
                            ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ) : null
              )}
          </div>
        </div>
        <div className="col-span-4 lg:col-span-3 lg:max-w-3xl xl:col-span-2 xl:max-w-none">
          {children}
        </div>
      </div>
    </MainLayout>
  );
};
