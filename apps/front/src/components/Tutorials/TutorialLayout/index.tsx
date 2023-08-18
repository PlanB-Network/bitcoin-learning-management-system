import { Disclosure } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';
import { generatePath } from 'react-router';
import { Link } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import {
  TUTORIALS_CATEGORIES,
  extractSubCategories,
} from '../../../pages/Tutorials/utils';
import { Routes } from '../../../types';
import { compose } from '../../../utils';
import { MainLayout } from '../../MainLayout';

export const TutorialLayout = ({
  children,
  currentCategory,
  currentSubcategory,
  currentTutorialId,
}: {
  children?: JSX.Element | JSX.Element[];
  currentCategory?: string;
  currentSubcategory?: string;
  currentTutorialId?: number;
}) => {
  const { t, i18n } = useTranslation();

  const { data: allTutorials } = trpc.content.getTutorials.useQuery({
    language: i18n.language,
  });

  return (
    <MainLayout>
      <div className="grid h-max min-h-screen w-full grid-cols-4 items-start bg-gray-100 px-3 py-5 md:px-6 md:py-10">
        <div className="hidden w-full pl-0 pr-10 lg:block xl:pl-10">
          <div className="w-full min-w-min max-w-[16rem] rounded-2xl bg-white p-2 drop-shadow">
            <h3 className="mx-2 mb-2 border-b-2 border-b-orange-600 py-1 text-lg font-semibold uppercase text-orange-600">
              Tutorials
            </h3>
            {allTutorials &&
              TUTORIALS_CATEGORIES.map((tutorialCategory) =>
                allTutorials.filter(
                  (tutorial) => tutorial.category === tutorialCategory.name
                ).length > 0 ? (
                  <Disclosure
                    key={
                      /* Trick to rerender the disclosure on current category change, so it opens the correct panel */
                      `${tutorialCategory.name}-${currentCategory}`
                    }
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
                          <Link
                            to={generatePath(Routes.TutorialCategory, {
                              category: tutorialCategory.name,
                            })}
                          >
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
                          </Link>
                        </Disclosure.Button>

                        <Disclosure.Panel className="pl-4 text-sm text-gray-500">
                          {allTutorials &&
                            extractSubCategories(
                              allTutorials.filter(
                                (tutorial) =>
                                  tutorial.category === tutorialCategory.name
                              )
                            ).map((subCategory) => (
                              <Disclosure
                                key={subCategory}
                                defaultOpen={subCategory === currentSubcategory}
                              >
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

                                    <Disclosure.Panel className="py-1 pl-8 pr-2 text-sm text-gray-500">
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
                                                className={compose(
                                                  ' group-hover:text-orange-600',
                                                  tutorial.id ===
                                                    currentTutorialId
                                                    ? 'text-orange-600'
                                                    : 'text-primary-600'
                                                )}
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
                                                className={compose(
                                                  'text-sm group-hover:text-orange-800',
                                                  tutorial.id ===
                                                    currentTutorialId
                                                    ? 'text-orange-800'
                                                    : 'text-primary-800 '
                                                )}
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
