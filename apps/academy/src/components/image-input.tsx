import { Button, cn, customToast, FieldLabel } from '@blms/ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbFileUpload } from 'react-icons/tb';

interface ImageInputProps {
  label: string;
  value: string | null;
  onChange: (base64: string, filename: string) => void;
  className?: string;
  isRequired?: boolean;
}

export const ImageInput = ({
  label,
  value,
  onChange,
  className,
  isRequired,
}: ImageInputProps) => {
  const { t } = useTranslation();
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDropError, setIsDropError] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImage = (file: File) => {
    const MAX_SIZE = 15 * 1024 * 1024; // 15MB

    if (!file.type.startsWith('image/')) {
      customToast(t('educatorContent.onlyImages'), {
        mode: 'light',
        color: 'warning',
      });
      setIsDropError(true);
      setTimeout(() => setIsDropError(false), 500);
      return;
    }

    if (file.size > MAX_SIZE) {
      customToast(t('educatorContent.imageTooLarge'), {
        mode: 'light',
        color: 'warning',
      });
      setIsDropError(true);
      setTimeout(() => setIsDropError(false), 500);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const webpDataUrl = canvas.toDataURL('image/webp', 1.0);
          const newFilename = file.name.replace(/\.[^/.]+$/, '') + '.webp';
          onChange(webpDataUrl, newFilename);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files?.[0]) {
      handleImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden min-h-[160px]',
          isDragActive ? 'duration-0' : 'duration-1000',
          isDropError
            ? 'border-red-400 bg-red-50'
            : isDragActive
              ? 'border-primary-400 bg-neutral-100'
              : 'border-neutral-200 bg-[#FAFAFA]',
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <div className="w-full aspect-4/3 mb-4 relative rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={value}
                alt={t('educatorContent.coverPreview')}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="w-32 z-10"
              size="s"
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
                isDragActive ? 'text-black' : 'text-gray-900',
              )}
            >
              {t('educatorContent.dropCover')}
            </p>
            <p
              className={cn(
                'text-xs mb-4',
                isDragActive ? 'text-black' : 'text-gray-900',
              )}
            >
              {t('educatorContent.browseImages')}
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => inputRef.current?.click()}
              className="w-32"
              size="s"
            >
              {t('forms.browse')}
            </Button>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImage(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
};
