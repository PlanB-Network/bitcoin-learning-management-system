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
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TbBrandGithub, TbBrandX, TbGlobe } from 'react-icons/tb';
import { z } from 'zod';

import Nostr from '#src/assets/icons/nostr.svg?react';
import { getLanguageName, LANGUAGES } from '#src/utils/i18n.js';
import { trpc } from '#src/utils/trpc.js';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
}

const createResourcePRSchema = z.object({
  type: z.string(),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  country: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string()).optional(),
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
  const { t } = useTranslation();
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
  const [coverImageName, setCoverImageName] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(createResourcePRSchema),
    defaultValues: {
      type: resourceType,
      title: '',
      description: '',
      language: 'en',
      tags: [],
      links: {
        website: '',
        twitter: '',
        github: '',
        nostr: '',
      },
    },
  });

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <BasicModal
      title={t(`resources.addResource.${resourceType}`)}
      open={isOpen}
      onOpenChange={onClose}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>
                {t('resources.addResource.title')}
              </FieldLabel>
              <Input
                {...field}
                placeholder={t('resources.addResource.titlePlaceholder')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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
                  {LANGUAGES.map((lang) => ({
                    value: lang,
                    label: getLanguageName(lang),
                  }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>
                {t('resources.addResource.category')}
              </FieldLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('resources.addResource.selectCategory')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {[
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
                  ].map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`resources.projects.types.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel required>
                {t('resources.addResource.description')}
              </FieldLabel>
              <Textarea
                {...field}
                placeholder={t('resources.addResource.descriptionPlaceholder')}
                className="min-h-[100px]"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex flex-col gap-2">
          <FieldLabel>{t('resources.addResource.coverImage')}</FieldLabel>
          <div
            className={cn(
              'border-2 border-dashed border-neutral-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer relative',
              coverImageBase64 && 'border-orange-500',
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            {coverImageBase64 ? (
              <img
                src={coverImageBase64}
                alt="Preview"
                className="max-h-32 rounded-lg"
              />
            ) : (
              <>
                <div className="text-neutral-400">
                  {t('resources.addResource.dropImage')}
                </div>
                <Button type="button" variant="primary" size="s">
                  {t('resources.addResource.browse')}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <FieldLabel>{t('resources.addResource.socialProfiles')}</FieldLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="links.github"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <TbBrandGithub size={20} className="shrink-0" />
                  <Input {...field} placeholder="Github URL" />
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="links.twitter"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <TbBrandX size={20} className="shrink-0" />
                  <Input {...field} placeholder="X URL" />
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="links.nostr"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Nostr className="shrink-0 size-5 fill-neutral-600" />
                  <Input {...field} placeholder="Nostr URL" />
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="links.website"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <TbGlobe size={20} className="shrink-0" />
                  <Input {...field} placeholder="Website URL" />
                </div>
              )}
            />
          </div>
        </div>

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
