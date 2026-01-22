import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import CoursesMarkdownBody from '#src/components/Markdown/courses-markdown-body.tsx';
import { PageLayout } from '#src/components/page-layout.tsx';

export const Route = createFileRoute('/$lang/educator-content-guide/')({
  component: EducatorContentGuidePage,
});

const GUIDE_CONTENT = `Thank you for being here! This guide will help you understand how to share your educational materials with the global Bitcoin educator community.

## Purpose

The goal of the Educator Content section is to help Bitcoin educators support each other and reduce duplicated work. This way, no one has to start from scratch every time they prepare a presentation or educational material.

We know how much effort and energy educators put into creating content for their local communities. We believe this content can be extremely valuable for other educators doing the same work around the world.

The idea is to be stronger together: better content, better distributed, and less time wasted recreating what already exists.

## What You Can Share

In the Educator Content section, Bitcoin educators and communities can share and distribute their content, as well as download materials created by others.

The content can take many forms:

- **Presentations:** Slide decks, workshop materials, curricula
- **Print materials:** Flyers, posters, stickers, banners
- **Documents:** Guides, handouts, worksheets, infographics

Content can be shared in any language, either as:

- **Static files:** PDF, PNG, JPG (ready to use or print)
- **Editable versions:** Canva links, Google Slides, source files (so others can adapt and customize)

**Supported file types:** Images, PDF, presentations, spreadsheets, text documents

## Content Guidelines

#### 1. Bitcoin-focused content only

Content shared in the Educator Content section must be directly related to Bitcoin, including its educational, economic, privacy, security or self-sovereignty aspects. Off-topic content may be moderated or removed.

#### 2. Share content that is useful to others

Upload files that you believe will benefit the Bitcoin community at large, especially for education purposes. The goal is to gather resources that can serve educators and communities teaching Bitcoin around the world.

Please avoid uploading files that have a very low probability of being used by others. Too many irrelevant files make it harder to find valuable content.

#### 3. Write clear titles and descriptions

Resources are much more impactful and useful when they are clearly named and described. Please provide context in your content description to help others understand:

- What the content is about
- How you have been using it
- How others might use it in their own context

Also, choose your cover image carefully and make sure it represents the content accurately.

When uploading files, use descriptive file names. The file name will be visible to other users when they download your content. Avoid generic names like "final_v2.png". Instead, use clear names that describe the content, such as "bitcoin-basics-workshop-slides.pdf".

#### 4. Group related files into bundles

The Educator Content section is designed for knowledge sharing and collaboration. To ensure readability and fair visibility, we encourage you to group related files together. For example, a series of presentations will have more visibility and impact as a curriculum, rather than as individual presentations that are hard to connect. Bundles make it easier for other educators to find and use complete sets of materials.

#### 5. Provide multiple formats when possible

For each resource, you can attach both links and files. This gives you the opportunity to:

- **Share links** to editable or duplicable resources (Canva, Google Slides, Figma), so other educators can adapt your work to their needs
- **Attach multiple file formats** (PDF, PNG, source files), so others can choose the format that works best for them

This flexibility makes your content more useful to a wider audience.

#### 6. Respect copyright

If you are adding content you did not create, the original source must be credited in the description. The content must also be shared under the same license it was originally published with.

When you upload content to the Educator Content portal, it is linked to your Plan ₿ Academy account. You are responsible for the content you share. Sharing copyrighted material without proper authorization is not allowed and will be subject to moderation.

**Only upload content you have the right to share.**

#### 7. Choose a license

All content is published under the CC-BY-SA license by default.

If you wish to apply a different license to your content, you can select from the following options:

- CC BY
- CC BY-NC
- CC BY-NC-SA
- CC BY-ND
- CC BY-NC-ND
- MIT

[Learn more about Creative Commons licenses](https://creativecommons.org/share-your-work/cclicenses/)

If you are not familiar with licenses, you can safely keep the recommended default option (CC-BY-SA).

#### 8. No promotions or spam

Promotional content is not allowed in the Educator Content section. This includes:

- Referral links
- Affiliate links
- Disguised commercial promotions

Such content will be removed.

Do not upload material that could be considered spam, scams, or that contains misleading information.

#### 9. Review Process

Once you submit your content for review, our team will check that it follows these guidelines.

- **If there are minor errors:** We will take the initiative to correct them directly.
- **If the content cannot be accepted without major corrections:** We will reject the submission.

In both cases, whether your content is accepted or rejected, you will receive a notification by email.

## Community Standards

#### 10. Respect contributors

Sharing educational content requires effort and courage. Feedback and criticism are therefore welcome **only if they are constructive, respectful and relevant**. Therefore, personal attacks or harmful comments will not be tolerated.

#### 11. No hate or harassment

Any contents or comments that promote **hate, discrimination or harassment are forbidden**. This includes remarks targeting race or skin color, religion, culture, origin or any other personal attribute.

#### 12. Be courteous and respect privacy

Treat everyone with respect. Healthy and constructive debates are encouraged, but courtesy is essential. Please also respect people's privacy and do not share personal information without consent.
`;

function EducatorContentGuidePage() {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t('educatorContent.guidelines.pageTitle')}
      layoutSize="base"
    >
      <div className="text-blue-950 flex flex-col w-full gap-5 wrap-break-word md:mt-8 md:grow md:gap-4 md:overflow-hidden pb-2">
        <CoursesMarkdownBody
          content={GUIDE_CONTENT}
          assetPrefix=""
          supportInlineLatex={false}
        />
      </div>
    </PageLayout>
  );
}
