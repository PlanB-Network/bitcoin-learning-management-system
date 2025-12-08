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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BiPlus, BiTrash, BiUpload } from 'react-icons/bi';
import { BsFileEarmarkCheckFill, BsX } from 'react-icons/bs';
import { z } from 'zod';
import {
  getEducatorContentCoverUrl,
  uploadEducatorContentCover,
  uploadEducatorContentFile,
} from '#src/services/content.js';
import { getLanguageName, LANGUAGES } from '#src/utils/i18n.ts';
import { trpc } from '#src/utils/trpc.js';
import { EducatorContentSuccessModal } from './educator-content-success-modal.tsx';

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
  const [createdContentId, setCreatedContentId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCoverDragActive, setIsCoverDragActive] = useState(false);
  const [isFilesDragActive, setIsFilesDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;
  const isPublished = initialData?.status === EducatorContentStatus.Published;

  const formSchema = z.object({
    title: z.string().min(1, t('educatorContent.titleRequired')),
    description: z.string().min(1, t('educatorContent.descriptionRequired')),
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
          links:
            initialData.links?.map((link) => ({
              ...link,
              label: link.label || undefined,
            })) || [],
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
        links: (values.links?.filter((l) => l.url && l.label) || []) as Array<{
          url: string;
          label: string;
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

  const handleDrag = (
    e: React.DragEvent,
    setIsDragActive: (active: boolean) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      // Prevent flickering when dragging over child elements
      if (
        e.relatedTarget &&
        (e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)
      ) {
        return;
      }
      setIsDragActive(false);
    }
  };

  const handleCoverDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCoverDragActive(false);
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
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden',
              isCoverDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-newGray-400 bg-white',
            )}
            onDragEnter={(e) => handleDrag(e, setIsCoverDragActive)}
            onDragLeave={(e) => handleDrag(e, setIsCoverDragActive)}
            onDragOver={(e) => handleDrag(e, setIsCoverDragActive)}
            onDrop={handleCoverDrop}
          >
            {previewUrl && !imageError ? (
              <>
                <div className="w-full h-48 mb-4 relative rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      if (e.currentTarget.src === activePreviewUrlRef.current) {
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
                <div className="bg-white border rounded shadow-sm p-2 mb-4">
                  <BiUpload size={24} className="text-gray-400" />
                </div>
                <p className="mb-2 text-sm font-medium text-gray-900">
                  {t('educatorContent.dropCover')}
                </p>
                <p className="text-xs text-gray-500 mb-6">
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
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors',
              isFilesDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-newGray-400 bg-white',
            )}
            onDragEnter={(e) => handleDrag(e, setIsFilesDragActive)}
            onDragLeave={(e) => handleDrag(e, setIsFilesDragActive)}
            onDragOver={(e) => handleDrag(e, setIsFilesDragActive)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFilesDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const droppedFiles = Array.from(e.dataTransfer.files);
                const validFiles = droppedFiles.filter((file) => {
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
          >
            <div className="bg-white border rounded shadow-sm p-2 mb-4">
              <BiUpload size={24} className="text-gray-400" />
            </div>
            <p className="mb-2 text-sm font-medium text-gray-900">
              {t('educatorContent.dropFiles')}
            </p>
            <p className="text-xs text-gray-500 mb-6">
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
              onChange={(e) => {
                if (e.target.files) {
                  const selectedFiles = Array.from(e.target.files);
                  const validFiles = selectedFiles.filter((file) => {
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
            {/* <p>Supported file types: .png, .pdf, .jpg</p> */}
            <p>Max file size: 50MB</p>
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
                      <BsFileEarmarkCheckFill size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">
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
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
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
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 flex items-center justify-center text-blue-600">
                      <BsFileEarmarkCheckFill size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {file.name} (New)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
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
