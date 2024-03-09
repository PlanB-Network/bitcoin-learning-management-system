import { Disclosure } from '@headlessui/react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';

import { MainLayout } from '../../components/MainLayout/index.tsx';
import { compose, trpc } from '../../utils/index.ts';

import { TUTORIALS_CATEGORIES, extractSubCategories } from './utils.tsx';

export const TutorialLayout = ({
  children,
  currentCategory,
  currentSubcategory,
  currentTutorialId,
}: {
  children?: JSX.Element | JSX.Element[];
  currentCategory?: string;
  currentSubcategory?: string | null;
  currentTutorialId?: number;
}) => {
  const { t, i18n } = useTranslation();

  const { data: allTutorials } = trpc.content.getTutorials.useQuery({
    language: i18n.language,
  });

  return (
    <MainLayout variant="light">
      <div className=":px-6 grid h-max min-h-screen w-full grid-cols-4 items-start bg-gray-100 px-3 py-5 md:py-10">
        <div className="hidden w-full pl-0 pr-10 lg:block xl:pl-10">
          <div className="w-full min-w-min max-w-[16rem] rounded-2xl bg-white p-2 drop-shadow">
            <h3 className="mx-2 mb-2 border-b-2 border-b-orange-500 py-1 text-lg font-semibold uppercase text-orange-500">
              Tutorials
            </h3>
            {allTutorials &&
              TUTORIALS_CATEGORIES.map((tutorialCategory) =>
                allTutorials.some(
                  (tutorial) => tutorial.category === tutorialCategory.name,
                ) ? (
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
                                ? 'rotate-180 align-middle text-blue-700'
                                : 'rotate-90 align-middle text-blue-600'
                            }
                          />
                          <Link
                            to={'/tutorials/$category'}
                            params={{
                              category: tutorialCategory.name,
                            }}
                          >
                            <span
                              className={compose(
                                'text-blue-800 align-middle uppercase',
                                open ? 'font-bold' : '',
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
                                  tutorial.category === tutorialCategory.name,
                              ),
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
                                            ? 'rotate-180 align-middle text-blue-700'
                                            : 'rotate-90 align-middle text-blue-600'
                                        }
                                      />
                                      <span
                                        className={compose(
                                          'text-blue-800 align-middle uppercase text-sm',
                                          open ? 'font-semibold' : '',
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
                                                subCategory,
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
                                                  ' group-hover:text-orange-500',
                                                  tutorial.id ===
                                                    currentTutorialId
                                                    ? 'text-orange-500'
                                                    : 'text-blue-600',
                                                )}
                                              />
                                              <Link
                                                to={
                                                  '/tutorials/$category/$name'
                                                }
                                                params={{
                                                  category: tutorial.category,
                                                  name: tutorial.name,
                                                }}
                                                className={compose(
                                                  'text-sm group-hover:text-orange-600',
                                                  tutorial.id ===
                                                    currentTutorialId
                                                    ? 'text-orange-600'
                                                    : 'text-blue-800 ',
                                                )}
                                              >
                                                {t(tutorial.title)}
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
                ) : null,
              )}
          </div>
        </div>
        <div className="col-span-4 lg:col-span-3 2xl:col-span-2">
          {/* Menu to add */}
          {/* <div className="w-96 bg-blue-200 lg:hidden">
            {TUTORIALS_CATEGORIES.map((tutorialCategory) => {
              return (
                <div className="grid grid-cols-5">
                  <img
                    className="col-span-1"
                    src={tutorialCategory.image}
                    alt="category"
                  />
                  <span className="col-span-4 uppercase text-blue-800">
                    {tutorialCategory.name}
                  </span>
                </div>
              );
            })}
          </div> */}
          {children}
        </div>
      </div>
    </MainLayout>
  );
};
