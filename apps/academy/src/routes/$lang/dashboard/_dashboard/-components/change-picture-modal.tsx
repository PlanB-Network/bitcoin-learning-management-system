import { t } from 'i18next';
import { useMemo, useRef, useState } from 'react';
import { Cropper, type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

import {
  BasicModal,
  Button,
  cn,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';

import spinner from '#src/assets/icons/spinner.svg';

interface Props {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onChange?: (file: File) => void;
}

enum Tabs {
  CROP,
  PREVIEW,
}

export const ChangePictureModal = (props: Props) => {
  const [image, setImage] = useState<string | undefined>();
  const [cropData, setCropData] = useState('');
  const cropperRef = useRef<ReactCropperElement>(null);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.CROP);
  const [loading, setLoading] = useState(false);

  const getCropData = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper && image) {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  useMemo(() => {
    setLoading(false);
    setActiveTab(Tabs.CROP);

    if (props.file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImage(reader.result as string));
      reader.readAsDataURL(props.file);
    }
  }, [props.file]);

  const sendBlobAsFile = (blob: Blob | null) => {
    if (blob && props.onChange) {
      setLoading(true);

      const file = new File([blob], 'profile-picture.png', {
        type: 'image/png',
      });

      props.onChange(file);
    }
  };

  const validateChange = () => {
    cropperRef.current?.cropper
      ?.getCroppedCanvas()
      .toBlob(sendBlobAsFile, 'image/png');
  };

  return (
    <BasicModal
      trigger={<button type="button" className="hidden" />}
      title={t('settings.changeProfilePicture')}
      open={props.isOpen}
      onOpenChange={props.onClose}
    >
      <div className="min-h-80 w-full">
        {image && (
          <SegmentedControl
            variant="outline"
            value={activeTab === Tabs.CROP ? 'crop' : 'preview'}
            onValueChange={(val) => {
              if (val === 'preview') getCropData();
              setActiveTab(val === 'crop' ? Tabs.CROP : Tabs.PREVIEW);
            }}
            className="mb-2 w-full"
          >
            <SegmentedControlItem value="crop">
              {t('dashboard.profile.crop')}
            </SegmentedControlItem>

            <SegmentedControlItem value="preview">
              {t('dashboard.profile.preview')}
            </SegmentedControlItem>
          </SegmentedControl>
        )}

        {/* Cropper */}
        <div className={cn(activeTab === Tabs.PREVIEW && 'hidden')}>
          <div className="size-96 p-2 mx-auto">
            {image && (
              <Cropper
                className="cropper border rounded size-full"
                initialAspectRatio={1}
                aspectRatio={1}
                src={image}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={true}
                responsive={false}
                restore={false}
                movable={false}
                scalable={false}
                zoomable={false}
                autoCropArea={1}
                checkOrientation={false}
                ref={cropperRef}
                guides={true}
                ready={() => {
                  const cropper = cropperRef.current?.cropper;
                  if (cropper) cropper.zoomTo(0.5);
                }}
              />
            )}
          </div>
        </div>

        {/* Preview */}
        <div className={cn(activeTab === Tabs.CROP && 'hidden')}>
          <div className="size-96 p-2 mx-auto">
            {cropData && (
              <img
                src={cropData}
                alt="cropped"
                className="object-cover size-full rounded-full"
              />
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-between items-center mt-2">
          {image &&
            (loading ? (
              <div className="flex gap-2 px-2">
                <span>{t('dashboard.profile.saving')}</span>
                <img src={spinner} alt="spinner" className="size-6" />
              </div>
            ) : (
              <>
                <Button variant="primary" size="m" onClick={validateChange}>
                  <span>{t('dashboard.profile.save')}</span>
                </Button>

                <Button variant="secondary" size="m" onClick={props.onClose}>
                  {t('dashboard.profile.cancel')}
                </Button>
              </>
            ))}
        </div>
      </div>
    </BasicModal>
  );
};
