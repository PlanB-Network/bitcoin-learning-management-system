import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';

import { cn } from '@sovereign-university/ui';

interface ModalProps {
  isOpen: boolean;
  closeButtonEnabled?: boolean;
  onClose: () => void;
  children: JSX.Element | JSX.Element[];
  headerText?: string;
  showAccountHelper?: boolean;
  isLargeModal?: boolean;
}

export const Modal = ({
  isOpen,
  closeButtonEnabled,
  onClose,
  children,
  headerText,
  showAccountHelper = false,
  isLargeModal,
}: ModalProps) => {
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[1000]"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-[6px] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className={cn(
              'flex items-end justify-center p-4 text-center sm:items-center sm:p-0',
              isLargeModal
                ? 'w-full max-w-[1440px] h-[90vh] sm:w-[80vw] sm:h-[85vh]'
                : '',
            )}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                style={{
                  ...(isLargeModal
                    ? {
                        width: '100%',
                        height: '100%',
                      }
                    : {}),
                }}
                className=""
              >
                <div
                  style={{
                    ...(isLargeModal
                      ? {
                          width: '100%',
                          height: '100%',
                          maxWidth: '100%',
                          margin: 0,
                          position: 'relative',
                        }
                      : {}),
                  }}
                  className={cn(
                    'max-h-screen overflow-auto rounded-[1.5em] bg-white px-4 py-2 text-left shadow-xl transition-all sm:mx-0 sm:my-8 sm:p-6',
                    isLargeModal ? 'md:pb-4 md:pt-5 lg:max-w-5xl lg:p-0' : '',
                  )}
                >
                  {closeButtonEnabled && (
                    <button className="mb-5 w-full flex justify-end">
                      <IoMdClose className="size-6" onClick={onClose} />
                    </button>
                  )}
                  <div className="flex flex-col items-center px-0.5 sm:px-5 gap-7">
                    {headerText && (
                      <h4 className="text-center desktop-h4 text-darkOrange-5">
                        {headerText}
                      </h4>
                    )}
                    {children}
                    {/* TODO: move this outside of the modal atom */}
                    {showAccountHelper && (
                      <div className="flex flex-col items-center text-center">
                        <div className="h-px bg-darkOrange-5 w-full max-w-40 rounded-3xl mb-2.5" />
                        <span className="desktop-h7 text-darkOrange-5">
                          {t('words.didYouKnow')}
                        </span>
                        <span className="text-darkOrange-5">
                          {t('auth.noAccountNeeded')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
