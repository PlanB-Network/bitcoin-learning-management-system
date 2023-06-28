import { Disclosure, Tab } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';
import { Link, generatePath, useNavigate } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';
import { JoinedTutorial } from '@sovereign-academy/types';

import { MainLayout } from '../../../components';
import { Routes } from '../../../types';
import { compose, computeAssetCdnUrl, useRequiredParams } from '../../../utils';
import { TUTORIALS_CATEGORIES } from '../types';

const extractSubCategories = (tutorials: JoinedTutorial[]) => {
  return [
    ...new Set(
      tutorials.filter((tutorial) => tutorial).map((t) => t.subcategory)
    ),
  ] as string[];
};

export const TutorialCategory = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { category } = useRequiredParams();

  const [subCategories, setSubCategories] = useState<string[]>([]);

  if (!TUTORIALS_CATEGORIES.some((c) => c.name === category)) {
    navigate(Routes.Tutorials);
  }

  const tutorialCategory = TUTORIALS_CATEGORIES.find(
    (c) => c.name === category
  ) as (typeof TUTORIALS_CATEGORIES)[0];

  const { data: tutorials } = trpc.content.getTutorialsByCategory.useQuery({
    category: tutorialCategory.name,
    // Add once translations are available
    // language: i18n.language,
  });

  const { data: allTutorials } = trpc.content.getTutorials.useQuery({
    // Add once translations are available
    // language: i18n.language,
  });

  useEffect(() => {
    if (tutorials) {
      setSubCategories(extractSubCategories(tutorials));
    }
  }, [tutorials]);

  return (
    <MainLayout>
      <div className="grid h-max w-full grid-cols-4 items-start bg-gray-100 px-6">
        <div className="w-full pr-16 pt-8">
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
                    defaultOpen={tutorialCategory.name === category}
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
                            {t(tutorialCategory.name)}
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
                                        {t(subCategory)}
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
        <div className="col-span-3 lg:max-w-3xl xl:col-span-2 xl:max-w-none">
          <div className="flex w-full flex-row items-end justify-start py-10">
            <div className="bg-secondary-400 relative z-0 flex h-24 w-24 rounded-full">
              <img
                className="absolute inset-0 m-auto h-16"
                src={tutorialCategory.image}
                alt=""
              />
            </div>
            <h1 className="text-primary-700 py-3 pl-8 text-6xl font-bold uppercase italic">
              {tutorialCategory.name}
            </h1>
          </div>
          <p className="text-primary-800 flex w-full">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
            quae voluptatum, voluptate, quos, quas voluptas quia quibusdam
            dolorum voluptatibus quod fugit. Quisquam quae voluptatum,
            voluptate, quos, quas voluptas quia quibusdam dolorum voluptatibus
            quod fugit. Quisquam quae voluptatum, voluptate, quos, quas voluptas
            quia quibusdam dolorum voluptatibus quod fugit.
          </p>
          {tutorials && (
            <div className="w-full px-2 py-16 sm:px-0">
              <Tab.Group>
                <Tab.List className="flex rounded-t-xl bg-gray-200">
                  {subCategories.map((subCategory) => (
                    <Tab
                      key={subCategory}
                      className={({ selected }) =>
                        compose(
                          'w-full first:rounded-tl-xl last:rounded-tr-xl py-2.5 font-medium text-primary-800 capitalize',
                          selected
                            ? 'bg-orange-800 shadow'
                            : 'text-blue-100 hover:bg-gray-100/[0.3] hover:text-orange-800'
                        )
                      }
                    >
                      {subCategory}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="rounded-b-xl bg-gray-200 pb-3">
                  {subCategories.map((subCategory) => (
                    <Tab.Panel key={subCategory}>
                      <div className="flex flex-col">
                        <div className="text-primary-900 px-10 py-6 text-sm font-thin italic">
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Quisquam quae voluptatum, voluptate, quos, quas
                          voluptas quia quibusdam dolorum voluptatibus quod
                          fugit. Quisquam quae voluptatum, voluptate, quos, quas
                          voluptas quia quibusdam dolorum voluptatibus quod
                          fugit.
                        </div>
                        {tutorials
                          .filter(
                            (tutorial) => tutorial.subcategory === subCategory
                          )
                          .map((tutorial) => (
                            <Link
                              key={tutorial.id}
                              to={generatePath(Routes.Tutorial, {
                                category: tutorialCategory.name,
                                tutorialId: tutorial.id.toString(),
                              })}
                              className="my-2 flex flex-row items-start justify-start space-x-8 rounded-md px-8 py-2.5"
                            >
                              <img
                                className="h-16 w-16 rounded-md"
                                src={
                                  tutorial.builder
                                    ? computeAssetCdnUrl(
                                        tutorial.builder.last_commit,
                                        `${tutorial.builder.path}/assets/logo.jpeg`
                                      )
                                    : undefined
                                }
                                alt=""
                              />
                              <div className="flex flex-col">
                                <h2 className="text-primary-700 text-lg font-semibold uppercase">
                                  {tutorial.name}
                                </h2>
                                <p className="text-primary-700 max-w-md text-xs capitalize">
                                  {tutorial.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </Tab.Group>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
