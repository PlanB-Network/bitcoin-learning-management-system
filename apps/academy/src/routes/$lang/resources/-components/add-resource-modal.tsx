import type { ResourceType } from '@blms/constants';
import {
  BasicModal,
  Button,
  cn,
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
import { ImageInput } from '#src/components/image-input.tsx';
import { trpc } from '#src/utils/trpc.js';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
}

interface ResourceFormConfig {
  showTitle?: boolean;
  showLanguage?: boolean;
  showCategory?: boolean;
  showDescription?: boolean;
  showCoverImage?: boolean;
  showSocialLinks?: boolean;
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
    showLanguage: false,
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
};

const createResourcePRSchema = z.object({
  type: z.string(),
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
  country: z.string().optional(),
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
  language: z.string(),
  coverImage: z
    .object({
      name: z.string(),
      data: z.string(), // base64
    })
    .optional(),
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

  const form = useForm<FormData>({
    resolver: zodResolver(createResourcePRSchema),
    defaultValues: {
      type: resourceType,
      title: '',
      description: '',
      language: i18n.language || 'en',
    },
  });

  const { data: languages } = useQuery(
    trpc.user.career.getLanguages.queryOptions(),
  );

  const sortedLanguages = languages
    ? [...languages].sort((a, b) => a.code.localeCompare(b.code))
    : [];

  const createPR = useMutation(
    trpc.github.createResourcePR.mutationOptions({
      onSuccess: () => {
        onClose();
        form.reset();
        setCoverImageBase64(null);
        setCoverImageName(null);
      },
    }),
  );

  const onSubmit = (data: FormData) => {
    createPR.mutate({
      ...data,
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

  return (
    <BasicModal
      title={t(`resources.addResource.${resourceType.replace(/s$/, '')}`)}
      open={isOpen}
      onOpenChange={onClose}
      size="large"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 w-full"
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

        {config.showLanguage && (
          <Controller
            control={form.control}
            name="language"
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
          />
        )}

        {config.showSocialLinks && (
          <div className="flex flex-col gap-3">
            <FieldLabel>{t('resources.addResource.socialProfiles')}</FieldLabel>
            <div className="flex flex-col gap-3">
              {socialLinksList
                .filter((link) => config.socialLinks?.includes(link.id))
                .map((link) => (
                  <Controller
                    key={link.id}
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
                ))}
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="l"
          className="w-full mt-4"
          disabled={createPR.isPending}
        >
          {createPR.isPending
            ? t('resources.addResource.sending')
            : t('resources.addResource.sendForReview')}
        </Button>
      </form>
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
