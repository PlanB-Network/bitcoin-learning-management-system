import { Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillCircleFill, BsFillTriangleFill } from 'react-icons/bs';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from '@blms/ui';

import { AppContext } from '#src/providers/context.js';

import {
  TUTORIALS_CATEGORIES,
  extractSubCategories,
} from '../../../../services/utils.tsx';

export const TutorialLayout = ({
  children,
  currentCategory,
  currentSubcategory,
  currentTutorialId,
}: {
  children?: JSX.Element | JSX.Element[];
  currentCategory?: string;
  currentSubcategory?: string | null;
  currentTutorialId?: string;
}) => {
  const { t } = useTranslation();

  const { tutorials: allTutorials } = useContext(AppContext);

  return (
    <div className=":px-6 grid h-max min-h-screen w-full grid-cols-4 items-start bg-white px-3 py-5 md:py-10 relative">
      <div className="hidden w-full pl-0 pr-10 lg:block xl:pl-10">
        <div className="w-full max-w-[280px] rounded-[20px] bg-newGray-6 shadow-course-navigation px-4 py-2.5">
          <h3 className="w-full border-b-2 border-b-darkOrange-3 text-2xl leading-snug uppercase text-darkOrange-5 mb-4">
            {t('words.tutorials')}
          </h3>
          {allTutorials &&
            TUTORIALS_CATEGORIES.map((tutorialCategory) =>
              allTutorials.some(
                (tutorial) => tutorial.category === tutorialCategory.name,
              ) ? (
                <Collapsible
                  key={
                    /* Trick to rerender the Collapsible on current category change, so it opens the correct panel */
                    `${tutorialCategory.name}-${currentCategory}`
                  }
                  defaultOpen={tutorialCategory.name === currentCategory}
                >
                  <>
                    <CollapsibleTrigger className="group flex w-full items-center justify-start pl-5 text-left gap-3 h-9">
                      <BsFillTriangleFill
                        size={13}
                        className="group-data-[state=open]:rotate-180 group-data-[state=closed]:rotate-90  text-newGray-1 transition-transform ease-in-out"
                      />
                      <Link
                        to={'/tutorials/$category'}
                        params={{
                          category: tutorialCategory.name,
                        }}
                        className={cn(
                          'text-black uppercase font-poppins group-data-[state=open]:font-bold group-data-[state=closed]:font-medium',
                        )}
                      >
                        {t([
                          `tutorials.${tutorialCategory.name}.name`,
                          tutorialCategory.name,
                        ])}
                      </Link>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="pl-12">
                      {allTutorials &&
                        extractSubCategories(
                          allTutorials.filter(
                            (tutorial) =>
                              tutorial.category === tutorialCategory.name,
                          ),
                        ).map((subCategory) => (
                          <Collapsible
                            key={subCategory}
                            defaultOpen={subCategory === currentSubcategory}
                          >
                            <>
                              <CollapsibleTrigger className="group flex w-full items-center justify-start gap-3 text-left text-sm h-6">
                                <BsFillCircleFill
                                  size={8}
                                  className="text-newGray-4"
                                />
                                <span
                                  className={cn(
                                    'text-newBlack-2 capitalize text-sm font-poppins group-data-[state=open]:font-semibold',
                                  )}
                                >
                                  {t([
                                    `tutorials.${tutorialCategory.name}.${subCategory}.name`,
                                    subCategory,
                                  ])}
                                </span>
                              </CollapsibleTrigger>

                              <CollapsibleContent className="pl-7">
                                <ul className="flex flex-col">
                                  {allTutorials
                                    .filter(
                                      (tutorial) =>
                                        tutorial.category ===
                                          tutorialCategory.name &&
                                        tutorial.subcategory === subCategory,
                                    )
                                    .map((tutorial) => (
                                      <li
                                        key={tutorial.id}
                                        className={
                                          'group flex list-none items-center justify-start min-h-6 gap-2'
                                        }
                                      >
                                        <BsFillCircleFill
                                          size={4}
                                          className={cn(
                                            ' group-hover:text-darkOrange-5 shrink-0',
                                            tutorial.id === currentTutorialId
                                              ? 'text-darkOrange-5'
                                              : 'text-newBlack-2',
                                          )}
                                        />
                                        <Link
                                          to={`/tutorials/${tutorial.category}/${tutorial.subcategory}/${tutorial.name}-${tutorial.id}`}
                                          className={cn(
                                            'text-xs group-hover:text-darkOrange-5 font-poppins',
                                            tutorial.id === currentTutorialId
                                              ? 'text-darkOrange-5 font-semibold'
                                              : 'text-newBlack-2 font-light',
                                          )}
                                        >
                                          {t(tutorial.title)}
                                        </Link>
                                      </li>
                                    ))}
                                </ul>
                              </CollapsibleContent>
                            </>
                          </Collapsible>
                        ))}
                    </CollapsibleContent>
                  </>
                </Collapsible>
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
  );
};
