import type { ResourceType } from '@blms/constants';
import {
  BasicModal,
  Button,
  cn,
  DividerSimple,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  TbBrandGithub,
  TbBrandLinkedin,
  TbBrandX,
  TbWorld,
} from 'react-icons/tb';
import { z } from 'zod';
import Nostr from '#src/assets/icons/nostr.svg?react';
import SuccessParty from '#src/assets/icons/success_party.svg?react';
import { ImageInput } from '#src/components/image-input.tsx';
import { trpc } from '#src/utils/trpc.js';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
}

interface ResourceFormConfig {
  showTitle?: boolean;
  showAuthor?: boolean;
  showLanguage?: boolean;
  showCategory?: boolean;
  showDescription?: boolean;
  showCoverImage?: boolean;
  showResourceLink?: boolean;
  showTrailerLink?: boolean;
  showSocialLinks?: boolean;
  showPublicationYear?: boolean;
  showDuration?: boolean;
  categories?: string[];
  socialLinks?: string[];
}

const RESOURCE_FORM_CONFIG: Record<string, ResourceFormConfig> = {
  projects: {
    showTitle: true,
    showCategory: true,
    showDescription: true,
    showCoverImage: true,
    showSocialLinks: true,
    categories: [
      'communities',
      'conference',
      'education',
      'exchange',
      'infrastructure',
      'investment',
      'manufacturer',
      'merchant',
      'mining',
      'news',
      'node',
      'payment',
      'privacy',
      'service',
      'wallet',
    ],
    socialLinks: ['github', 'twitter', 'website', 'nostr'],
  },
  books: {
    showTitle: true,
    showAuthor: true,
    showDescription: true,
    showCoverImage: true,
    showPublicationYear: true,
  },
  podcasts: {
    showTitle: true,
    showAuthor: true,
    showDescription: true,
    showCoverImage: true,
    showResourceLink: true,
    showLanguage: true,
  },
  channels: {
    showTitle: true,
    showDescription: true,
    showCoverImage: true,
    showResourceLink: true,
    showTrailerLink: true,
    showLanguage: true,
  },
  newsletters: {
    showTitle: true,
    showDescription: true,
    showLanguage: true,
    showAuthor: true,
    showCoverImage: true,
    showResourceLink: true,
  },
  movies: {
    showTitle: true,
    showDescription: true,
    showLanguage: true,
    showAuthor: true,
    showDuration: true,
    showPublicationYear: true,
    showCoverImage: true,
    showResourceLink: true,
    showTrailerLink: true,
  },
};

const createResourcePRSchema = z.object({
  type: z.enum([
    'projects',
    'books',
    'movies',
    'podcasts',
    'channels',
    'newsletters',
  ]),
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  category: z.string().optional(),
  publicationYear: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  links: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
      nostr: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional(),
  resourceLink: z.string().optional(),
  trailerLink: z.string().optional(),
  language: z.string(),
  contentLanguage: z.string().optional(),
  coverImage: z
    .object({
      name: z.string(),
      data: z.string(), // base64
    })
    .optional(),
  duration: z.number().optional(),
});

type FormData = z.infer<typeof createResourcePRSchema>;

export const AddResourceModal = ({
  isOpen,
  onClose,
  resourceType,
}: AddResourceModalProps) => {
  const { t, i18n } = useTranslation();
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
  const [coverImageName, setCoverImageName] = useState<string | null>(null);
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createResourcePRSchema),
    defaultValues: {
      type: resourceType as FormData['type'],
      title: '',
      description: '',
      language: i18n.language || 'en',
      contentLanguage: 'en',
      publicationYear: new Date().getFullYear().toString(),
    },
  });

  const { data: languages } = useQuery(
    trpc.content.getLanguages.queryOptions(),
  );

  const sortedLanguages = languages
    ? [...languages].sort((a, b) => a.code.localeCompare(b.code))
    : [];

  const createPR = useMutation(
    trpc.github.createResourcePR.mutationOptions({
      onSuccess: () => {
        setIsSuccess(true);
        form.reset();
        setCoverImageBase64(null);
        setCoverImageName(null);
      },
    }),
  );

  const handleClose = () => {
    onClose();
    setIsSuccess(false);
  };

  const onSubmit = (data: FormData) => {
    const hours = durationHours ? Number.parseInt(durationHours) : 0;
    const minutes = durationMinutes ? Number.parseInt(durationMinutes) : 0;
    const totalMinutes = config.showDuration ? hours * 60 + minutes : undefined;

    createPR.mutate({
      ...data,
      type: data.type,
      duration: totalMinutes,
      coverImage:
        coverImageBase64 && coverImageName
          ? {
              data: coverImageBase64,
              name: coverImageName,
            }
          : undefined,
    });
  };

  const config = RESOURCE_FORM_CONFIG[resourceType] || {};

  const authorWordReplacement = resourceType === 'podcasts' ? 'host' : 'author';

  const watchAllFields = form.watch();

  const isFormComplete =
    (!config.showTitle || !!watchAllFields.title) &&
    (!config.showAuthor || !!watchAllFields.author) &&
    (!config.showCategory || !!watchAllFields.category) &&
    (!config.showDescription || !!watchAllFields.description) &&
    (!config.showCoverImage || !!coverImageBase64) &&
    (!config.showResourceLink || !!watchAllFields.resourceLink) &&
    (!config.showLanguage || !!watchAllFields.contentLanguage) &&
    (!config.showDuration ||
      (durationHours !== '' && durationMinutes !== '')) &&
    (!config.showPublicationYear || !!watchAllFields.publicationYear);

  return (
    <BasicModal
      title={
        isSuccess
          ? ''
          : t(`resources.addResource.${resourceType.replace(/s$/, '')}`)
      }
      open={isOpen}
      onOpenChange={handleClose}
      size="large"
    >
      {isSuccess ? (
        <div className="flex flex-col items-center gap-5 w-full text-center">
          <SuccessParty className="size-10 md:size-15 fill-orange-500" />
          <h2 className="title-small md:title-large">
            {t('resources.addResource.successTitle', {
              type: t(
                `words.${
                  resourceType === 'papers'
                    ? 'researchPaper'
                    : resourceType.replace(/s$/, '')
                }`,
              ),
            })}
          </h2>
          <p className="body-base md:label-label text-center">
            {t('resources.addResource.successSubtitle', {
              type: t(
                `words.${
                  resourceType === 'papers'
                    ? 'researchPaper'
                    : resourceType.replace(/s$/, '')
                }`,
              ).toLowerCase(),
            })}
          </p>
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 md:gap-6 w-full"
        >
          {config.showTitle && (
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>{t('words.title')}</FieldLabel>
                  <Input
                    {...field}
                    placeholder={t('resources.addResource.titlePlaceholder')}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {config.showAuthor && (
            <Controller
              control={form.control}
              name="author"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>
                    {t(`words.${authorWordReplacement}`)}
                  </FieldLabel>
                  <Input {...field} placeholder="Satoshi Nakamoto" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {config.showDuration && (
            <Field>
              <FieldLabel required>{t('words.duration')}</FieldLabel>
              <div className="flex items-center gap-1">
                <Select value={durationHours} onValueChange={setDurationHours}>
                  <SelectTrigger className="w-19">
                    <SelectValue placeholder="Hh" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xl">:</span>
                <Select
                  value={durationMinutes}
                  onValueChange={setDurationMinutes}
                >
                  <SelectTrigger className="w-19">
                    <SelectValue placeholder="Mm" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {m.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Field>
          )}

          {config.showCategory && config.categories && (
            <Controller
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>{t('words.category')}</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('resources.addResource.selectCategory')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {config.categories?.map((category) => (
                        <SelectItem key={category} value={category}>
                          {t(
                            `resources.${resourceType}.types.${category}`,
                            category,
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {config.showDescription && (
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>{t('words.description')}</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder={t(
                      'resources.addResource.descriptionPlaceholder',
                    )}
                    className="min-h-[100px]"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {config.showCoverImage && (
            <ImageInput
              label={t('resources.addResource.coverImage')}
              value={coverImageBase64}
              onChange={(base64, filename) => {
                setCoverImageBase64(base64);
                setCoverImageName(filename);
              }}
              isRequired={config.showCoverImage}
            />
          )}

          {config.showSocialLinks && (
            <div className="flex flex-col gap-2">
              <FieldLabel>
                {t('resources.addResource.socialProfiles')}
              </FieldLabel>
              <div className="flex flex-col gap-3">
                {socialLinksList
                  .filter((link) => config.socialLinks?.includes(link.id))
                  .map((link, index, array) => (
                    <div key={link.id} className="flex flex-col gap-3">
                      <Controller
                        control={form.control}
                        name={link.name}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="flex items-center gap-2">
                              <link.icon
                                size={link.id === 'nostr' ? undefined : 20}
                                className={cn(
                                  'shrink-0',
                                  link.id === 'nostr' && 'size-5 fill-current',
                                )}
                              />
                              <span className="capitalize">{link.id}</span>
                            </FieldLabel>
                            <Input {...field} placeholder={link.placeholder} />
                          </Field>
                        )}
                      />
                      {index < array.length - 1 && (
                        <DividerSimple className="max-md:hidden" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {config.showResourceLink && (
            <Controller
              control={form.control}
              name="resourceLink"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>
                    {t('resources.addResource.resourceLink')}
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="https://www.youtube.com/@PlanBNetwork"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {config.showTrailerLink && (
            <Controller
              control={form.control}
              name="trailerLink"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    {t('resources.addResource.trailerLink')}
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="https://www.youtube.com/watch?v=Ow4i4p0RyvI"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          {config.showPublicationYear && (
            <Controller
              control={form.control}
              name="publicationYear"
              render={({ field }) => (
                <Field>
                  <FieldLabel required>
                    {t('resources.addResource.publicationYear')}
                  </FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('resources.addResource.selectYear')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: 100 },
                        (_, i) => new Date().getFullYear() - i,
                      ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          )}

          {config.showLanguage && (
            <Controller
              control={form.control}
              name="contentLanguage"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel required>{t('words.language')}</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('resources.addResource.selectLanguage')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.nativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="l"
            className="w-full mt-4"
            disabled={createPR.isPending || !isFormComplete}
          >
            {createPR.isPending
              ? t('resources.addResource.sending')
              : t('resources.addResource.sendForReview')}
          </Button>
        </form>
      )}
    </BasicModal>
  );
};

const socialLinksList = [
  {
    id: 'github',
    icon: TbBrandGithub,
    placeholder: 'https://github.com/PlanB-Network/bitcoin-educational-content',
    name: 'links.github' as const,
  },
  {
    id: 'twitter',
    icon: TbBrandX,
    placeholder: 'https://x.com/planb_network',
    name: 'links.twitter' as const,
  },
  {
    id: 'nostr',
    icon: Nostr,
    placeholder: 'https://nostr.com/PlanB-Network/',
    name: 'links.nostr' as const,
  },
  {
    id: 'website',
    icon: TbWorld,
    placeholder: 'https://planb.academy',
    name: 'links.website' as const,
  },
  {
    id: 'linkedin',
    icon: TbBrandLinkedin,
    placeholder: 'https://linkedin.com/company/planb-network',
    name: 'links.linkedin' as const,
  },
];
