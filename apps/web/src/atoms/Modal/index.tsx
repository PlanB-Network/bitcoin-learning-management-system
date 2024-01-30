import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';

interface ModalProps {
  isOpen: boolean;
  closeButtonEnabled?: boolean;
  onClose: () => void;
  children: JSX.Element | JSX.Element[];
  headerText?: string;
  showAccountHelper?: boolean;
}

export const Modal = ({
  isOpen,
  closeButtonEnabled,
  onClose,
  children,
  headerText,
  showAccountHelper = false,
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
          <div className="fixed inset-0 bg-gray-500/95 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            className="flex items-end justify-center p-4 text-center sm:items-center sm:p-0"
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
              <Dialog.Panel>
                <div className="overflow-hidden rounded-[1.5em] border-4 border-orange-600 bg-white px-4 py-2 text-left shadow-xl transition-all sm:mx-0 sm:my-8 sm:max-w-lg sm:p-6 md:pb-4 md:pt-5">
                  {closeButtonEnabled && (
                    <button>
                      <IoMdClose
                        className="flex h-6 w-6 items-center justify-between"
                        onClick={onClose}
                      />
                    </button>
                  )}
                  <header className="flex flex-col items-center justify-between text-center text-xl font-semibold uppercase text-gray-400 md:my-6 md:text-3xl">
                    {headerText && <h4>{headerText}</h4>}
                  </header>
                  {children}
                </div>
                {/* TODO: move this outside of the modal atom */}
                {showAccountHelper && (
                  <div className="relative my-8 max-w-xs sm:max-w-lg md:my-14">
                    <div className="relative justify-center overflow-hidden rounded-[1em] border-4 border-orange-600 bg-orange-400 py-4 text-sm text-white shadow-xl transition-all sm:max-w-lg sm:rounded-[1.5em] sm:text-base">
                      <span className="italic text-blue-800">
                        {t('words.didYouKnow')}
                        <div>{t('auth.noAccountNeeded')}</div>
                      </span>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
