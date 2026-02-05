import { Loader } from '@blms/ui';
import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLayout } from '#src/components/page-layout.tsx';

const CoursesMarkdownBody = lazy(
  () => import('#src/components/Markdown/courses-markdown-body.tsx'),
);

export const Route = createFileRoute('/$lang/educator-content-guide/')({
  component: EducatorContentGuidePage,
});

function useGuideContent() {
  const { t } = useTranslation();
  const g = (key: string) => t(`educatorContent.guideContent.${key}`);

  return `${g('intro')}

## ${g('purposeTitle')}

${g('purposeP1')}

${g('purposeP2')}

${g('purposeP3')}

## ${g('whatYouCanShareTitle')}

${g('whatYouCanShareP1')}

${g('whatYouCanShareP2')}

- ${g('whatYouCanSharePresentations')}
- ${g('whatYouCanSharePrint')}
- ${g('whatYouCanShareDocuments')}

${g('whatYouCanShareP3')}

- ${g('whatYouCanShareStatic')}
- ${g('whatYouCanShareEditable')}

${g('whatYouCanShareFileTypes')}

## ${g('contentGuidelinesTitle')}

#### ${g('guideline1Title')}

${g('guideline1P1')}

#### ${g('guideline2Title')}

${g('guideline2P1')}

${g('guideline2P2')}

#### ${g('guideline3Title')}

${g('guideline3P1')}

- ${g('guideline3Bullet1')}
- ${g('guideline3Bullet2')}
- ${g('guideline3Bullet3')}

${g('guideline3P2')}

${g('guideline3P3')}

#### ${g('guideline4Title')}

${g('guideline4P1')}

#### ${g('guideline5Title')}

${g('guideline5P1')}

- ${g('guideline5Bullet1')}
- ${g('guideline5Bullet2')}

${g('guideline5P2')}

#### ${g('guideline6Title')}

${g('guideline6P1')}

${g('guideline6P2')}

${g('guideline6P3')}

#### ${g('guideline7Title')}

${g('guideline7P1')}

${g('guideline7P2')}

- CC BY
- CC BY-NC
- CC BY-NC-SA
- CC BY-ND
- CC BY-NC-ND
- MIT

[${g('guideline7LearnMore')}](https://creativecommons.org/share-your-work/cclicenses/)

${g('guideline7P3')}

#### ${g('guideline8Title')}

${g('guideline8P1')}

- ${g('guideline8Bullet1')}
- ${g('guideline8Bullet2')}
- ${g('guideline8Bullet3')}

${g('guideline8P2')}

${g('guideline8P3')}

#### ${g('guideline9Title')}

${g('guideline9P1')}

- ${g('guideline9Bullet1')}
- ${g('guideline9Bullet2')}

${g('guideline9P2')}

## ${g('communityStandardsTitle')}

#### ${g('guideline10Title')}

${g('guideline10P1')}

#### ${g('guideline11Title')}

${g('guideline11P1')}

#### ${g('guideline12Title')}

${g('guideline12P1')}
`;
}

function EducatorContentGuidePage() {
  const { t } = useTranslation();
  const guideContent = useGuideContent();

  return (
    <PageLayout
      title={t('educatorContent.guidelines.pageTitle')}
      layoutSize="base"
    >
      <div className="text-blue-950 flex flex-col w-full gap-5 wrap-break-word md:mt-8 md:grow md:gap-4 md:overflow-hidden pb-2">
        <Suspense fallback={<Loader size={'s'} />}>
          <CoursesMarkdownBody
            content={guideContent}
            assetPrefix=""
            supportInlineLatex={false}
          />
        </Suspense>
      </div>
    </PageLayout>
  );
}
