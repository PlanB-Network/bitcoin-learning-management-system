import {
  BasicModal,
  Button,
  cn,
  SegmentedControl,
  SegmentedControlItem,
} from '@blms/ui';
import type { CropperSelection as CropperSelectionElement } from 'cropperjs';
import {
  CropperCanvas,
  CropperGrid,
  CropperHandle,
  CropperImage,
  CropperSelection,
  CropperShade,
} from 'cropperjs-react-wrapper';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import spinner from '#src/assets/icons/spinner.svg';
import { useSmaller } from '#src/hooks/use-smaller.ts';

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
  const { t } = useTranslation();
  const isMobile = useSmaller('md');

  const [image, setImage] = useState<string | undefined>();
  const [cropData, setCropData] = useState('');
  const selectionRef = useRef<CropperSelectionElement>(null);
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.CROP);
  const [loading, setLoading] = useState(false);

  const getCropData = async () => {
    const selection = selectionRef.current;
    if (selection && image) {
      const canvas = await selection.$toCanvas();
      setCropData(canvas.toDataURL());
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (selectionRef.current) {
        selectionRef.current.initialCoverage = 0.3;
      }
    }, 500);
  });

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

  const validateChange = async () => {
    const selection = selectionRef.current;
    if (selection) {
      const canvas = await selection.$toCanvas();
      canvas.toBlob(sendBlobAsFile, 'image/png');
    }
  };

  const selectColor = 'rgba(51, 153, 255, 0.9)';

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
          <div className="max-w-full size-96 p-2 mx-auto flex-1">
            {image && (
              <CropperCanvas
                background
                className="h-full w-full object-contain border rounded"
              >
                <CropperImage
                  src={image}
                  alt="Picture"
                  scalable={true}
                  translatable={true}
                  onReady={(image) => {
                    image.$center('contain');
                    image.$addStyles('h-12');
                  }}
                />
                <CropperShade />
                <CropperHandle action="select" plain />
                <CropperSelection
                  initialCoverage={0.2}
                  aspectRatio={1}
                  movable
                  resizable
                  zoomable
                  keyboard
                  outlined
                  bounded
                  ref={selectionRef}
                >
                  <CropperGrid role="grid" covered bordered />
                  <CropperHandle action="move" themeColor="rgba(0, 0, 0, 0)" />
                  <CropperHandle action="n-resize" themeColor={selectColor} />
                  <CropperHandle action="e-resize" themeColor={selectColor} />
                  <CropperHandle action="s-resize" themeColor={selectColor} />
                  <CropperHandle action="w-resize" themeColor={selectColor} />
                  <CropperHandle action="ne-resize" themeColor={selectColor} />
                  <CropperHandle action="nw-resize" themeColor={selectColor} />
                  <CropperHandle action="se-resize" themeColor={selectColor} />
                  <CropperHandle action="sw-resize" themeColor={selectColor} />
                </CropperSelection>
              </CropperCanvas>
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
                <Button
                  variant="secondary"
                  className="w-full"
                  size={isMobile ? 'm' : 'l'}
                  onClick={props.onClose}
                >
                  {t('dashboard.profile.cancel')}
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  size={isMobile ? 'm' : 'l'}
                  onClick={validateChange}
                >
                  <span>{t('dashboard.profile.save')}</span>
                </Button>
              </>
            ))}
        </div>
      </div>
    </BasicModal>
  );
};
