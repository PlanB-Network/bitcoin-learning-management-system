import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoMdClose } from 'react-icons/io';

import rabbitHikingModal from '../../assets/rabbit-modal-auth.svg';

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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
                <div className="max-w-xs overflow-hidden rounded-[1.5em] border-4 border-orange-600 bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:mx-0 sm:my-8 sm:max-w-lg sm:p-6">
                  {closeButtonEnabled && (
                    <button>
                      <IoMdClose
                        className="flex h-6 w-6 items-center justify-between"
                        onClick={onClose}
                      />
                    </button>
                  )}
                  <header className="flex flex-col items-center justify-between text-center text-3xl font-semibold uppercase text-gray-400 md:my-6">
                    {headerText && <h4>{headerText}</h4>}
                  </header>
                  {children}
                </div>
                {/* TODO: move this outside of the modal atom */}
                {showAccountHelper && (
                  <div className="relative my-14 max-w-xs sm:max-w-lg">
                    <img
                      src={rabbitHikingModal}
                      alt={t('imagesAlt.rabbitHikingModal')}
                      className="sm:h-23 absolute -left-10 bottom-12 z-[+1] flex h-20 sm:-left-10 sm:bottom-14"
                    ></img>
                    <div className="bg-orange-400 relative justify-center overflow-hidden rounded-[1em] border-4 border-orange-600 py-4 text-sm text-white shadow-xl transition-all sm:max-w-lg sm:rounded-[1.5em] sm:text-base">
                      <span className="text-blue-800 italic">
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
