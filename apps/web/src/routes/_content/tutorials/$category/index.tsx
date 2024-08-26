import {
  Link,
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { capitalize } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Tabs, TabsContent, TabsList, TabsTrigger, cn } from '@blms/ui';

import Spinner from '#src/assets/spinner_orange.svg?react';
import { CategoryIcon } from '#src/components/CategoryIcon/index.js';
import PageMeta from '#src/components/Head/PageMeta/index.js';
import { SITE_NAME } from '#src/utils/meta.js';
import { trpc } from '#src/utils/trpc.js';

import { TutorialCard } from '../-components/tutorial-card.tsx';
import { TutorialLayout } from '../-other/layout.tsx';
import {
  TUTORIALS_CATEGORIES,
  extractSubCategories,
} from '../-other/utils.tsx';

export const Route = createFileRoute('/_content/tutorials/$category/')({
  component: TutorialCategory,
});

function TutorialCategory() {
  const { t, i18n } = useTranslation();
  const { category } = useParams({
    from: '/tutorials/$category',
  });

  const navigate = useNavigate();

  const tutorialCategory = TUTORIALS_CATEGORIES.find(
    (c) => c.name === category,
  );

  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [currentSubCategory, setCurrentSubCategory] = useState<
    string | undefined
  >();

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

  useEffect(() => {
    if (tutorials) {
      const subCats = extractSubCategories(tutorials).sort();
      setSubCategories(subCats);
      if (subCats.length > 0) {
        setCurrentSubCategory(subCats[0]);
      }
    }
  }, [tutorials]);

  const handleTabChange = (value: string) => {
    setCurrentSubCategory(value);
  };

  return (
    <TutorialLayout currentCategory={category}>
      <PageMeta
        title={`${SITE_NAME} - ${capitalize(tutorialCategory!.name)}`}
        description={t(`tutorials.${category}.description`)}
      />
      {/* Breadcrumb, temporarily commented */}
      {/* <div className="mb-6 -mt-4 w-full max-w-5xl lg:hidden">
        <span className=" mb-2 w-full text-left text-lg font-normal leading-6 text-orange-500">
          <Link to="/tutorials">{t('words.tutorials') + ` > `}</Link>
          <span className="capitalize">{tutorialCategory!.name}</span>
        </span>
      </div> */}

      <div className="lg:max-w-[785px] xl:max-w-5xl">
        <div className="flex w-full items-center gap-5">
          <CategoryIcon src={tutorialCategory!.image} className="size-16" />
          <h1 className="text-black capitalize display-large">
            {tutorialCategory!.name}
          </h1>
        </div>
        <p className="hidden w-full text-justify body-16px text-black md:flex">
          {t(`tutorials.${category}.description`)}
        </p>
        {!isFetched && <Spinner className="size-24 md:size-32 mx-auto" />}
        {tutorials && subCategories.length > 0 && (
          <div className="w-full px-2 py-4 md:px-0">
            <Tabs
              value={currentSubCategory}
              onValueChange={handleTabChange}
              className="rounded-lg md:rounded-[20px] shadow-course-navigation overflow-hidden flex flex-col gap-0 bg-transparent"
            >
              <TabsList className="flex flex-wrap bg-newGray-5 shadow-course-card relative z-[2] p-0 gap-0 !rounded-none">
                {subCategories.map((subCategory, index) => (
                  <TabsTrigger
                    value={subCategory}
                    key={subCategory}
                    className={cn(
                      'max-md:basis-1/2 basis-1/4 grow md:w-full overflow-hidden px-3 py-2 md:px-2 md:py-4 font-medium capitalize md:border-l md:first:border-l-0 !outline-none',
                      'data-[state=active]:border-none data-[state=active]:bg-darkOrange-1 data-[state=active]:text-darkOrange-5 data-[state=inactive]:text-newBlack-3 data-[state=inactive]:hover:text-darkOrange-5',
                      (index + 1) % 2 === 0 && 'max-md:border-l',
                      subCategories.length > 2 &&
                        index - 1 <= 0 &&
                        'max-md:border-b',
                    )}
                  >
                    {t([
                      `tutorials.${category}.${subCategory}.name`,
                      subCategory,
                    ])}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="bg-newGray-5">
                {subCategories.map((subCategory) => (
                  <TabsContent value={subCategory} key={subCategory}>
                    <div className="flex flex-col px-2 py-5 md:px-7 md:py-8 gap-4 md:gap-6">
                      {/* {i18n.exists(
                        `tutorials.${category}.${subCategory}.description`,
                      ) && (
                        <div className="hidden text-sm font-light italic text-blue-900 ">
                          {t(
                            `tutorials.${category}.${subCategory}.description`,
                          )}
                        </div>
                      )} */}
                      <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
                        {tutorials
                          .filter(
                            (tutorial) => tutorial.subcategory === subCategory,
                          )
                          .map((tutorial) => (
                            <TutorialCard
                              key={tutorial.id}
                              tutorial={tutorial}
                              href={`/tutorials/${tutorial.category}/${tutorial.name}`}
                            />
                          ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        )}

        <div className="flex justify-center lg:hidden mt-6">
          <Link to="/tutorials">
            <Button
              variant="ghost"
              mode="light"
              onHoverArrow
              onHoverArrowDirection="left"
            >
              {t('tutorials.backTutorials')}
            </Button>
          </Link>
        </div>
      </div>
    </TutorialLayout>
  );
}
