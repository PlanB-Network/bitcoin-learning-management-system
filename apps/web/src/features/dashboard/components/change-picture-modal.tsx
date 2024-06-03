import { t } from 'i18next';
import { useMemo, useState } from 'react';
import 'cropperjs/dist/cropper.css';
import { Cropper } from 'react-cropper';

import { Button, cn } from '@sovereign-university/ui';

import { Modal } from '#src/atoms/Modal/index.tsx';
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
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.CROP);
  const [loading, setLoading] = useState(false);

  const getCropData = () => {
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

  const validateChange = () =>
    cropper?.getCroppedCanvas().toBlob(sendBlobAsFile, 'image/png');

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      headerText={t('settings.changeProfilePicture')}
    >
      <div className="min-h-80 my-4">
        <div className={cn('flex border-y', !image && 'hidden')}>
          <button
            className={cn(
              'p-2 flex-1',
              activeTab === Tabs.CROP &&
                'bg-darkOrange-5 text-white cursor-default',
            )}
            onClick={() => setActiveTab(Tabs.CROP)}
          >
            {t('dashboard.profile.crop')}
          </button>

          <button
            className={cn(
              'p-2 flex-1',
              activeTab === Tabs.PREVIEW &&
                'bg-darkOrange-5 text-white cursor-default',
            )}
            onClick={() => (getCropData(), setActiveTab(Tabs.PREVIEW))}
          >
            {t('dashboard.profile.preview')}
          </button>
        </div>

        {/* Cropper */}
        <div className={cn('p-4', activeTab === Tabs.PREVIEW && 'hidden')}>
          <div className="size-96 p-2 mx-auto">
            <Cropper
              className="cropper border rounded size-full"
              zoomTo={0.5}
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
              onInitialized={(instance: Cropper) => setCropper(instance)}
              guides={true}
            />
          </div>
        </div>

        {/* Preview */}
        <div className={cn('p-4', activeTab === Tabs.CROP && 'hidden')}>
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

        <div className="p-4 flex gap-4 justify-between items-center">
          {image && (
            <>
              {loading ? (
                <div className="flex gap-2 px-2">
                  <span>{t('dashboard.profile.saving')}</span>
                  <img src={spinner} alt="spinner" className="size-6" />
                </div>
              ) : (
                <>
                  <Button
                    variant="newPrimary"
                    size="m"
                    onClick={validateChange}
                  >
                    <span>{t('dashboard.profile.save')}</span>
                  </Button>

                  <Button variant="secondary" size="m" onClick={props.onClose}>
                    {t('dashboard.profile.cancel')}
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
