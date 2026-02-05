import {
  CategorySwitcher,
  CategorySwitcherBar,
  EmptyState,
  Loader,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { CategoryIcon } from '#src/components/category-icon.js';
import { PageLayout } from '#src/components/page-layout.tsx';
import { SearchInput } from '#src/components/search-input.tsx';
import { AppContext } from '#src/providers/context.tsx';
import {
  extractSubCategories,
  TUTORIALS_CATEGORIES,
} from '#src/services/utils.tsx';
import { TutorialCard } from '../-components/tutorial-card.tsx';
import { getTutorialsTabs } from '../index.tsx';

export const Route = createFileRoute('/$lang/tutorials/$category/')({
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

  const [searchTerm, setSearchTerm] = useState('');

  const { tutorials: allTutorials } = useContext(AppContext);
  const isFetched = allTutorials && allTutorials.length > 0;

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
    if (allTutorials) {
      const filteredTutorials = allTutorials.filter(
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
  }, [allTutorials]);

  const handleTabChange = (value: string) => {
    setCurrentSubCategory(value);
    window.location.hash = value;
  };

  const filteredTutorials = allTutorials
    ?.filter((tutorial) => {
      const matchesCategory = tutorial.category === tutorialCategory?.name;
      const matchesSubCategory =
        tutorial.subcategory === (currentSubCategory ?? subCategories[0]);

      const matchesSearch = tutorial.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSubCategory && matchesSearch;
    })
    .sort((a, b) => b.likeCount - a.likeCount);

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
      tabs={getTutorialsTabs(t)}
    >
      {!isFetched && <Loader size={'s'} />}

      <SearchInput
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        className="ml-auto mb-4"
        fullWidthOnMobile
      />
      {allTutorials && subCategories.length > 0 && (
        <>
          <SegmentedControl
            variant="outline"
            value={currentSubCategory ?? subCategories[0]}
            defaultValue={subCategories[0]}
            className="w-full mt-2 max-md:hidden"
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

          <div className="w-full md:hidden">
            <CategorySwitcherBar>
              {subCategories.map((subCategory) => (
                <CategorySwitcher
                  key={subCategory}
                  onClick={() => {
                    handleTabChange(subCategory);
                  }}
                  isActive={subCategory === currentSubCategory}
                  text={t([
                    `tutorials.subCategories.${subCategory}`,
                    subCategory,
                  ])}
                  size="s"
                  inactiveBackgroundColor="bg-neutral-50"
                />
              ))}
            </CategorySwitcherBar>
          </div>

          <div className="mt-5 md:mt-2 flex flex-col">
            {filteredTutorials && filteredTutorials.length > 0 ? (
              filteredTutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))
            ) : (
              <EmptyState title={t('tutorials.noTutorialsFound')} />
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}
