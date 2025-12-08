import { EducatorContentStatus, EducatorContentType } from '@blms/constants';
import {
  BasicModal,
  Button,
  customToast,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@blms/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BiPlus, BiTrash } from 'react-icons/bi';
import { BsFileEarmarkCheckFill, BsX } from 'react-icons/bs';
import { z } from 'zod';
import {
  uploadEducatorContentCover,
  uploadEducatorContentFile,
} from '#src/services/content.js';
import { getLanguageName, LANGUAGES } from '#src/utils/i18n.ts';
import { trpc } from '#src/utils/trpc.js';
import { EducatorContentSuccessModal } from './educator-content-success-modal.tsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // Using any for now to avoid strict type issues with JoinedEducatorContent vs form values
}

export const EducatorContentModal = ({
  isOpen,
  onClose,
  initialData,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createdContentId, setCreatedContentId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;
  const isPublished = initialData?.status === EducatorContentStatus.Published;

  const formSchema = z.object({
    title: z.string().min(1, t('educatorContent.titleRequired')),
    description: z.string().min(1, t('forms.required')),
    language: z.string().min(1, t('educatorContent.languageRequired')),
    type: z
      .enum(EducatorContentType)
      .optional()
      .refine((val) => !!val, {
        message: t('educatorContent.typeRequired'),
      }),
    links: z
      .array(
        z.object({
          url: z.string().optional(),
          label: z.string().optional(),
        }),
      )
      .optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      language: '',
      type: undefined as unknown as EducatorContentType,
      links: [],
    },
  });

  const prevIsOpen = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      // Modal just opened
      if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description,
          language: initialData.language,
          type: initialData.type as EducatorContentType,
          links: initialData.links || [],
        });
        setExistingFiles(initialData.files || []);
      } else {
        form.reset({
          title: '',
          description: '',
          language: '',
          type: undefined as unknown as EducatorContentType,
          links: [],
        });
        setExistingFiles([]);
      }
      setCoverImage(null);
      setNewFiles([]);
      setIsSuccessModalOpen(false);
    } else if (isOpen && initialData && prevIsOpen.current) {
      // Modal is open and initialData changed (e.g. background update)
      // Optional: decide if we want to update form values live.
      // For now, let's NOT automatically overwrite form if user might be typing,
      // UNLESS we want to reflect the "fresh" data after validation.
      // But the loop issue was caused by setIsSuccessModalOpen(false) running here.
      // So simply removing that call from this path fixes the loop.
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, initialData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const createContentMutation = useMutation(
    trpc.content.createEducatorContent.mutationOptions({
      onSuccess: (data) => {
        const newId = (data as any)?.[0]?.id;
        if (newId) {
          setCreatedContentId(newId);
        }
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        setIsSuccessModalOpen(true);
      },
      onError: (error: any) => {
        customToast(error.message, { mode: 'light', color: 'warning' });
      },
    }),
  );

  const updateContentMutation = useMutation(
    trpc.content.updateEducatorContent.mutationOptions({
      onSuccess: (data) => {
        const newId = (data as any)?.[0]?.id;
        if (newId) {
          setCreatedContentId(newId);
        }
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        setIsSuccessModalOpen(true);
      },
      onError: (error: any) => {
        customToast(error.message, { mode: 'light', color: 'warning' });
      },
    }),
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const uploadedFiles =
      newFiles.length > 0
        ? await Promise.all(
            newFiles.map((file) =>
              uploadEducatorContentFile(file).then((res) => ({
                path: res.id,
                name: file.name,
                mime_type: file.type,
                size: file.size,
              })),
            ),
          )
        : [];

    const allFiles = [
      ...existingFiles.map((f) => ({
        path: f.path,
        name: f.name,
        mime_type: f.mime_type || f.mimeType,
        size: f.size,
      })),
      ...uploadedFiles,
    ];

    const coverPath = coverImage
      ? await uploadEducatorContentCover(coverImage).then((res) => res.id)
      : initialData?.cover || undefined;

    const commonData = {
      ...values,
      cover: coverPath,
      files: allFiles,
      links: (values.links?.filter((l) => l.url && l.label) || []) as Array<{
        url: string;
        label: string;
      }>,
    };

    if (isEditing) {
      if (isPublished) {
        // Create new draft linked to original
        createContentMutation.mutate({
          ...commonData,
          status: EducatorContentStatus.Draft,
          originalId: initialData.id,
        } as any);
      } else {
        // Update existing draft/rejected
        updateContentMutation.mutate({
          ...commonData,
          id: initialData.id,
          status: EducatorContentStatus.Draft,
        } as any);
      }
    } else {
      // Create new content
      createContentMutation.mutate({
        ...commonData,
        status: EducatorContentStatus.Draft,
      } as any);
    }
  };

  const isLoading =
    createContentMutation.isPending || updateContentMutation.isPending;

  if (isSuccessModalOpen) {
    return (
      <EducatorContentSuccessModal
        isOpen={true}
        onClose={() => {
          setIsSuccessModalOpen(false);
          onClose();
          if (createdContentId) {
            navigate({
              to: '/$lang/educator-content/$id',
              params: { id: createdContentId },
            });
          }
        }}
      />
    );
  }

  return (
    <BasicModal
      open={isOpen}
      onOpenChange={onClose}
      title={
        isEditing
          ? t('educatorContent.editMaterial', 'Edit Material')
          : t('educatorContent.addMaterial')
      }
      contentClassName="max-w-[600px]"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 text-left w-full"
      >
        <FieldGroup className="gap-2">
          <h3 className="font-semibold">
            {t('educatorContent.resourceDetails')}
          </h3>

          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel htmlFor={field.name} required>
                  {t('words.title')}
                </FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  {t('educatorContent.titleHelper')}
                </p>
                <Input
                  id={field.name}
                  placeholder="e.g. Multi-sig workshop Liana"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel htmlFor={field.name} required>
                  {t('words.description')}
                </FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  {t('educatorContent.descriptionHelper')}
                </p>
                <Textarea
                  id={field.name}
                  placeholder={t('educatorContent.descriptionPlaceholder')}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="w-[200px]">
            <Controller
              control={form.control}
              name="language"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('words.language')}
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue
                        placeholder={t('educatorContent.languagePlaceholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {getLanguageName(lang)}
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
          </div>
        </FieldGroup>

        <FieldGroup className="gap-2">
          <h3 className="font-semibold">{t('educatorContent.resourceType')}</h3>
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-1"
                >
                  {Object.values(EducatorContentType).map((type) => (
                    <div
                      key={type}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <RadioGroupItem value={type} id={type} />
                      <label
                        htmlFor={type}
                        className="font-normal capitalize cursor-pointer"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="space-y-4">
          <h3 className="font-semibold">{t('educatorContent.imageCover')}</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <p className="mb-4 text-sm text-gray-500">
              {t('educatorContent.dropCover')}
            </p>
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setCoverImage(e.target.files[0]);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverImage || initialData?.cover
                ? t('words.replace')
                : t('words.browse')}
            </Button>
            {coverImage && (
              <p className="mt-2 text-sm text-green-600">{coverImage.name}</p>
            )}
            {!coverImage && initialData?.cover && (
              <p className="mt-2 text-sm text-gray-500">
                Current cover present
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">{t('educatorContent.shareLinks')}</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Controller
                control={form.control}
                name={`links.${index}.url`}
                render={({ field, fieldState }) => (
                  <Field className="flex-1" data-invalid={fieldState.invalid}>
                    <Input placeholder="https://example.com" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name={`links.${index}.label`}
                render={({ field, fieldState }) => (
                  <Field className="flex-1" data-invalid={fieldState.invalid}>
                    <Input placeholder="Label" {...field} />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="s"
                onClick={() => remove(index)}
              >
                <BiTrash />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ url: '', label: '' })}
          >
            <BiPlus className="mr-2" /> {t('educatorContent.addMoreUrls')}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">{t('educatorContent.uploadFiles')}</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <p className="mb-4 text-sm text-gray-500">
              {t('educatorContent.dropFiles')}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setNewFiles((prev) => [
                    ...prev,
                    ...Array.from(e.target.files!),
                  ]);
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('words.browse')}
            </Button>
            <p className="mt-2 text-xs text-gray-400">
              Supported file types: .png, .pdf, .jpg
            </p>
          </div>

          {(existingFiles.length > 0 || newFiles.length > 0) && (
            <div className="flex flex-col gap-2">
              {existingFiles.map((file, index) => (
                <div
                  key={`existing-${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <BsFileEarmarkCheckFill size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {file.name} (Existing)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingFiles((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <BsX size={20} className="text-gray-400" />
                  </button>
                </div>
              ))}
              {newFiles.map((file, index) => (
                <div
                  key={`new-${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <BsFileEarmarkCheckFill size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {file.name} (New)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <BsX size={20} className="text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading
            ? t('words.loading')
            : isEditing
              ? t(
                  'educatorContent.editAndRequireApproval',
                  'Edit and require approval',
                )
              : t('educatorContent.uploadForReview')}
        </Button>
      </form>
    </BasicModal>
  );
};
