import { EducatorContentStatus, EducatorContentType } from '@blms/constants';
import type { JoinedEducatorContent } from '@blms/types';
import {
  BasicModal,
  Button,
  cn,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  TbCircleCheckFilled,
  TbFileCheck,
  TbFileUpload,
  TbPlus,
  TbTrash,
  TbX,
} from 'react-icons/tb';
import { z } from 'zod';
import {
  getEducatorContentCoverUrl,
  uploadEducatorContentCover,
  uploadEducatorContentFile,
} from '#src/services/content.js';

import { trpc } from '#src/utils/trpc.js';
import { EducatorContentSuccessModal } from './educator-content-success-modal.tsx';

// Allowed file types for educator content uploads
const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // PDF
  'application/pdf',
  // Microsoft Office
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // LibreOffice / OpenDocument
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: JoinedEducatorContent;
  isAdmin?: boolean;
}

export const EducatorContentModal = ({
  isOpen,
  onClose,
  initialData,
  isAdmin = false,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: allExistingLanguages } = useQuery(
    trpc.user.career.getLanguages.queryOptions(),
  );
  const sortedLanguages = allExistingLanguages
    ? [...allExistingLanguages].sort((a, b) => a.code.localeCompare(b.code))
    : [];

  const [createdContentId, setCreatedContentId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCoverDragActive, setIsCoverDragActive] = useState(false);
  const [isFilesDragActive, setIsFilesDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFilesDropSuccess, setIsFilesDropSuccess] = useState(false);
  const [isCoverDropError, setIsCoverDropError] = useState(false);
  const [isFilesDropError, setIsFilesDropError] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;
  const isPublished = initialData?.status === EducatorContentStatus.Published;

  const formSchema = z.object({
    title: z
      .string()
      .min(1, t('educatorContent.titleRequired'))
      .max(60, t('educatorContent.titleTooLong')),
    description: z
      .string()
      .min(1, t('educatorContent.descriptionRequired'))
      .max(350, t('educatorContent.descriptionTooLong')),
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
          url: z
            .string()
            .optional()
            .refine((val) => !val || z.string().url().safeParse(val).success, {
              message: t('educatorContent.urlInvalid'),
            }),
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      // Modal just opened
      if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description || '',
          language: initialData.language,
          type: initialData.type as EducatorContentType,
          links: initialData.links?.map((link) => ({ ...link })) || [],
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
      setImageError(false);
      setIsSubmitting(false);
      setIsFilesDropSuccess(false);
      setIsCoverDropError(false);
      setIsFilesDropError(false);
    } else if (isOpen && initialData && prevIsOpen.current) {
      // Modal is open and initialData changed (e.g. background update)
      setImageError(false);
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
        setIsSubmitting(false);
      },
      onError: (error: any) => {
        customToast(error.message, { mode: 'light', color: 'warning' });
        setIsSubmitting(false);
      },
    }),
  );

  const updateContentMutation = useMutation(
    trpc.content.updateEducatorContent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        setIsSuccessModalOpen(true);
        setIsSubmitting(false);
      },
      onError: (error: any) => {
        customToast(error.message, { mode: 'light', color: 'warning' });
        setIsSubmitting(false);
      },
    }),
  );

  const adminUpdateContentMutation = useMutation(
    trpc.content.adminUpdateEducatorContent.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.content.getEducatorContents.queryKey(),
        });
        onClose();
        setIsSubmitting(false);
      },
      onError: (error: any) => {
        customToast(error.message, { mode: 'light', color: 'warning' });
        setIsSubmitting(false);
      },
    }),
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!coverImage && !initialData?.cover) {
      customToast(t('educatorContent.coverRequired'), {
        mode: 'light',
        color: 'warning',
      });
      return;
    }

    // Check if at least one link or one file is provided
    const hasValidLink = values.links?.some(
      (link) => link.url && link.url.trim() !== '',
    );
    const hasFiles = existingFiles.length > 0 || newFiles.length > 0;

    if (!hasValidLink && !hasFiles) {
      customToast(t('educatorContent.linkOrFileRequired'), {
        mode: 'light',
        color: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedFiles = [];

      if (newFiles.length > 0) {
        for (const file of newFiles) {
          try {
            const res = await uploadEducatorContentFile(file);
            uploadedFiles.push({
              path: res.id,
              name: file.name,
              mime_type: file.type,
              size: file.size,
            });
          } catch (error) {
            console.error('File upload failed', error);
            throw new Error(`Failed to upload file: ${file.name}`);
          }
        }
      }

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
        links: (values.links?.filter((l) => l.url) || []) as Array<{
          url: string;
        }>,
      };

      if (isAdmin && isEditing) {
        await adminUpdateContentMutation.mutateAsync({
          ...commonData,
          id: initialData.id,
        } as any);
      } else if (isEditing) {
        if (isPublished) {
          // Create new draft linked to original
          await createContentMutation.mutateAsync({
            ...commonData,
            status: EducatorContentStatus.Draft,
            originalId: initialData.id,
          } as any);
        } else {
          // Update existing draft/rejected
          await updateContentMutation.mutateAsync({
            ...commonData,
            id: initialData.id,
            status: EducatorContentStatus.Draft,
          } as any);
        }
      } else {
        // Create new content
        await createContentMutation.mutateAsync({
          ...commonData,
          status: EducatorContentStatus.Draft,
        } as any);
      }
    } catch (error: any) {
      customToast(error.message, { mode: 'light', color: 'warning' });
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting;

  // Drag and drop handlers
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const activePreviewUrlRef = useRef<string>('');
  const coverDragCounter = useRef(0);
  const filesDragCounter = useRef(0);

  useEffect(() => {
    if (coverImage) {
      const url = URL.createObjectURL(coverImage);
      setPreviewUrl(url);
      activePreviewUrlRef.current = url;
      setImageError(false);
      return () => URL.revokeObjectURL(url);
    }
    const defaultUrl = getEducatorContentCoverUrl(initialData?.cover) || '';
    setPreviewUrl(defaultUrl);
    activePreviewUrlRef.current = defaultUrl;
    setImageError(false);
  }, [coverImage, initialData?.cover]);

  const handleDragEnter = (
    e: React.DragEvent,
    counterRef: React.MutableRefObject<number>,
    setIsDragActive: (active: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent,
    counterRef: React.MutableRefObject<number>,
    setIsDragActive: (active: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current -= 1;
    if (counterRef.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragActive(false);
    coverDragCounter.current = 0;
    setImageError(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setCoverImage(file);
      } else {
        customToast(t('educatorContent.onlyImages'), {
          mode: 'light',
          color: 'warning',
        });
        setIsCoverDropError(true);
        setTimeout(() => setIsCoverDropError(false), 500);
      }
    }
  };

  const handleFilesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFilesDragActive(false);
    filesDragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((file) => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          customToast(t('educatorContent.fileTypeNotAllowed'), {
            mode: 'light',
            color: 'warning',
          });
          return false;
        }
        if (file.size > 50 * 1024 * 1024) {
          customToast(t('educatorContent.fileTooLarge'), {
            mode: 'light',
            color: 'warning',
          });
          return false;
        }
        return true;
      });
      setNewFiles((prev) => [...prev, ...validFiles]);
      if (validFiles.length > 0) {
        setIsFilesDropSuccess(true);
        setTimeout(() => setIsFilesDropSuccess(false), 500);
      }
      if (validFiles.length < droppedFiles.length) {
        setIsFilesDropError(true);
        setTimeout(() => setIsFilesDropError(false), 500);
      }
    }
  };

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
          ? t('educatorContent.editMaterial')
          : t('educatorContent.addMaterial')
      }
      contentClassName="max-w-[600px]"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 text-left w-full"
      >
        <FieldGroup className="gap-6">
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="gap-0">
                <FieldLabel htmlFor={field.name}>{t('words.title')}</FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  {t('educatorContent.titleHelper')}
                </p>
                <Input
                  id={field.name}
                  placeholder={t('educatorContent.titlePlaceholder')}
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
                <FieldLabel htmlFor={field.name}>
                  {t('words.description')}
                </FieldLabel>
                <p className="text-xs text-gray-500 mb-2">
                  {t('educatorContent.descriptionHelper')}
                </p>
                <Textarea
                  id={field.name}
                  placeholder={t('educatorContent.descriptionHelper')}
                  maxLength={350}
                  {...field}
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={cn(
                      'text-xs',
                      field.value.length >= 350
                        ? 'text-red-500'
                        : 'text-gray-400',
                    )}
                  >
                    {field.value.length}/350
                  </span>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="w-[200px] -mt-4">
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
                    <SelectTrigger id={field.name} ref={field.ref}>
                      <SelectValue
                        placeholder={t('educatorContent.languagePlaceholder')}
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
          </div>
        </FieldGroup>

        <FieldGroup className="gap-2">
          <h3 className="title-medium md:subtitle-base">
            {t('educatorContent.resourceType')}
          </h3>
          <Controller
            control={form.control}
            name="type"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-1"
                  ref={field.ref}
                >
                  {Object.values(EducatorContentType)
                    .map((type) => ({
                      id: type,
                      name: t(`educatorContent.types.${type}`),
                    }))
                    .sort((a, b) => {
                      if (a.id === EducatorContentType.Other) return 1;
                      if (b.id === EducatorContentType.Other) return -1;
                      return a.name.localeCompare(b.name);
                    })
                    .map(({ id, name }) => (
                      <div
                        key={id}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <RadioGroupItem value={id} id={id} />
                        <label
                          htmlFor={id}
                          className="font-normal cursor-pointer"
                        >
                          {name}
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
          <h3 className="body-base-bold">{t('educatorContent.imageCover')}</h3>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden',
              isCoverDragActive ? 'duration-0' : 'duration-1000',
              isCoverDropError
                ? 'border-red-400 bg-red-50'
                : isCoverDragActive
                  ? 'border-primary-400 bg-neutral-100'
                  : 'border-neutral-200 bg-[#FAFAFA]',
            )}
            onDragEnter={(e) =>
              handleDragEnter(e, coverDragCounter, setIsCoverDragActive)
            }
            onDragLeave={(e) =>
              handleDragLeave(e, coverDragCounter, setIsCoverDragActive)
            }
            onDragOver={handleDragOver}
            onDrop={handleCoverDrop}
          >
            {previewUrl && !imageError ? (
              <>
                <div className="w-full aspect-4/3 mb-4 relative rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt={t('educatorContent.coverPreview')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.currentTarget.src === activePreviewUrlRef.current) {
                        customToast(t('educatorContent.imageError'), {
                          mode: 'light',
                          color: 'warning',
                        });
                        setImageError(true);
                      }
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverInputRef.current?.click();
                  }}
                  className="w-32 z-10"
                >
                  {t('forms.replace')}
                </Button>
              </>
            ) : (
              <>
                <TbFileUpload size={24} className="text-neutral-200 mb-4" />
                <p
                  className={cn(
                    'mb-1 text-sm font-medium',
                    isCoverDragActive ? 'text-black' : 'text-gray-900',
                  )}
                >
                  {t('educatorContent.dropCover')}
                </p>
                <p
                  className={cn(
                    'text-xs mb-4',
                    isCoverDragActive ? 'text-black' : 'text-gray-900',
                  )}
                >
                  {t('educatorContent.browseImages')}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => coverInputRef.current?.click()}
                  className="w-32"
                >
                  {t('forms.browse')}
                </Button>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setCoverImage(e.target.files[0]);
                  setImageError(false);
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="title-medium md:subtitle-base">
            {t('educatorContent.shareLinks')}
          </h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Controller
                control={form.control}
                name={`links.${index}.url`}
                render={({ field, fieldState }) => (
                  <Field className="flex-1" data-invalid={fieldState.invalid}>
                    <Input
                      placeholder={t('educatorContent.linkPlaceholder')}
                      {...field}
                    />
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
                <TbTrash />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="tertiary"
            className="w-full"
            onClick={() => append({ url: '' })}
          >
            <TbPlus className="mr-4" /> {t('educatorContent.addMoreLinks')}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="title-medium md:subtitle-base">
            {t('educatorContent.uploadFiles')}
          </h3>
          <p className="body-small text-gray-500 -mt-4">
            {t('educatorContent.uploadFilesHelper')}
          </p>
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors',
              isFilesDragActive ? 'duration-0' : 'duration-1000',
              isFilesDropError
                ? 'border-red-300 bg-red-100'
                : isFilesDropSuccess
                  ? 'border-green-400 bg-green-100'
                  : isFilesDragActive
                    ? 'border-primary-400 bg-neutral-100'
                    : 'border-neutral-200 bg-[#FAFAFA]',
            )}
            onDragEnter={(e) =>
              handleDragEnter(e, filesDragCounter, setIsFilesDragActive)
            }
            onDragLeave={(e) =>
              handleDragLeave(e, filesDragCounter, setIsFilesDragActive)
            }
            onDragOver={handleDragOver}
            onDrop={handleFilesDrop}
          >
            <TbFileUpload size={24} className="text-neutral-200 mb-4" />
            <p
              className={cn(
                'mb-1 text-sm font-medium',
                isFilesDragActive ? 'text-black' : 'text-gray-900',
              )}
            >
              {t('educatorContent.dropFiles')}
            </p>
            <p
              className={cn(
                'text-xs mb-4',
                isFilesDragActive ? 'text-black' : 'text-gray-900',
              )}
            >
              {t('educatorContent.browseFiles')}
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="w-32"
            >
              {t('forms.browse')}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.odp,.ods"
              onChange={(e) => {
                if (e.target.files) {
                  const selectedFiles = Array.from(e.target.files);
                  const validFiles = selectedFiles.filter((file) => {
                    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                      customToast(t('educatorContent.fileTypeNotAllowed'), {
                        mode: 'light',
                        color: 'warning',
                      });
                      return false;
                    }
                    if (file.size > 50 * 1024 * 1024) {
                      customToast(t('educatorContent.fileTooLarge'), {
                        mode: 'light',
                        color: 'warning',
                      });
                      return false;
                    }
                    return true;
                  });
                  setNewFiles((prev) => [...prev, ...validFiles]);
                }
              }}
            />
          </div>

          <div className="flex justify-between items-center mt-2 mb-4 text-xs text-gray-400">
            <p>{t('educatorContent.supportedFileTypes')}</p>
            <p>{t('educatorContent.maxFileSize')}</p>
          </div>

          {(existingFiles.length > 0 || newFiles.length > 0) && (
            <div className="flex flex-col gap-2">
              {existingFiles.map((file, index) => (
                <div
                  key={`existing-${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-green-100 shrink-0 flex items-center justify-center text-green-600">
                      <TbFileCheck size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {file.name} {t('educatorContent.fileExisting')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingFiles((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                    className="p-2 hover:bg-neutral-100 bg-neutral-50 rounded-full transition-colors shrink-0"
                  >
                    <TbX size={16} />
                  </button>
                </div>
              ))}
              {newFiles.map((file, index) => (
                <div
                  key={`new-${file.name}-${index}`}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <TbCircleCheckFilled size={16} className="text-green-400" />
                    <span className="body-base truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="p-2 hover:bg-neutral-100 bg-neutral-50 rounded-full transition-colors shrink-0"
                  >
                    <TbX size={16} />
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
            ? t('educatorContent.uploading')
            : isEditing
              ? isAdmin
                ? t('words.edit')
                : t('educatorContent.editAndRequireApproval')
              : t('educatorContent.uploadForReview')}
        </Button>
      </form>
    </BasicModal>
  );
};
