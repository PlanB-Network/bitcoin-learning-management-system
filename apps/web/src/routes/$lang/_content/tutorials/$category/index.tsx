import { Loader, SegmentedControl, SegmentedControlItem } from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CategoryIcon } from '#src/components/category-icon.js';
import { PageLayout } from '#src/components/page-layout.tsx';
import { AppContext } from '#src/providers/context.tsx';
import {
  extractSubCategories,
  TUTORIALS_CATEGORIES,
} from '#src/services/utils.tsx';
import { TutorialCard } from '../-components/tutorial-card.tsx';
import { tutorialsTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/_content/tutorials/$category/')({
  component: TutorialCategory,
  params: {
    parse: (params) => ({
      category: z.string().parse(params.category),
      lang: z.string(),
    }),
    stringify: ({ category, lang }) => ({
      category: `${category}`,
      lang: `${lang}`,
    }),
  },
});

function TutorialCategory() {
  const { t } = useTranslation();
  const params = Route.useParams();
  const category = params.category;

  const navigate = useNavigate();

  const tutorialCategory = TUTORIALS_CATEGORIES.find(
    (c) => c.name === category,
  );

  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [currentSubCategory, setCurrentSubCategory] = useState<
    string | undefined
  >();

  const { tutorials: allTutorials } = useContext(AppContext);
  const isFetched = allTutorials && allTutorials.length > 0;

  const tutorials = allTutorials?.filter(
    (tutorial) => tutorial.category === tutorialCategory?.name,
  );

  useEffect(() => {
    let hash = location.hash.replace('#', '');
    hash = decodeURI(hash);
    const validTabs = subCategories.map((tab) => tab);
    setCurrentSubCategory(
      validTabs.includes(hash) ? hash : subCategories.at(0),
    );
  }, [subCategories]);

  useEffect(() => {
    if (!tutorialCategory) {
      navigate({
        to: '/tutorials',
      });
    }
  }, [tutorialCategory, navigate]);

  useEffect(() => {
    if (tutorials) {
      const filteredTutorials = tutorials.filter(
        (tutorial) => tutorial.category === tutorialCategory?.name,
      );
      const subCats = extractSubCategories(
        filteredTutorials,
        tutorialCategory?.name ?? '',
      );
      setSubCategories(subCats);
      if (subCats.length > 0) {
        setCurrentSubCategory(subCats[0]);
      }
    }
  }, [tutorials]);

  const handleTabChange = (value: string) => {
    setCurrentSubCategory(value);
    window.location.hash = value;
  };

  return (
    <PageLayout
      layoutSize="base"
      title={t(`tutorials.${tutorialCategory!.name}.title`)}
      icon={
        <CategoryIcon
          src={tutorialCategory!.image}
          className="size-8 md:size-10 mb-2 md:mb-6"
        />
      }
      tabs={tutorialsTabs}
    >
      {!isFetched && <Loader size={'s'} />}
      {tutorials && subCategories.length > 0 && (
        <>
          <SegmentedControl
            variant="outline"
            value={currentSubCategory ?? subCategories[0]}
            defaultValue={subCategories[0]}
            className="w-full max-md:mt-4 mt-2"
          >
            {subCategories.map((subCategory) => (
              <SegmentedControlItem
                value={subCategory}
                key={subCategory}
                onClick={() => handleTabChange(subCategory)}
                className="w-full min-w-fit px-3"
              >
                {t([`tutorials.subCategories.${subCategory}`, subCategory])}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <div className="mt-6 md:mt-2 flex flex-col">
            {[...tutorials]
              .filter(
                (tutorial) =>
                  tutorial.subcategory ===
                  (currentSubCategory ?? subCategories[0]),
              )
              .sort((a, b) => b.likeCount - a.likeCount)
              .map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
