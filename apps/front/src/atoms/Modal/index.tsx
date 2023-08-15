import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import rabbitHikingModal from '../../assets/rabbit-modal-auth.svg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element | JSX.Element[];
  headerText?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  headerText,
}: ModalProps) => {
  const cancelButtonRef = useRef(null);
  const { t } = useTranslation();

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
                <div className="overflow-hidden bg-white rounded-[1.5em]  border-4 border-orange-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all max-w-xs sm:mx-0 sm:my-8 sm:max-w-lg sm:p-6">
                  {' '}
                  {/*   <button>
                    <IoMdClose
                      className="flex h-6 w-6 items-center justify-between"
                      onClick={onClose}
                    />
                  </button> */}
                  <header className="my-6 flex h-6 flex-col items-center justify-between uppercase text-gray-400 text-xl font-medium">
                    {headerText && <h4>{headerText}</h4>}
                  </header>
                  {children}
                </div>
                <div className="relative max-w-xs sm:max-w-lg">
                  <img
                    src={rabbitHikingModal}
                    alt={t('imagesAlt.rabbitHikingModal')}
                    className="absolute hidden sm:h-m h-23 sm:bottom-14 sm:-left-10 z-[+1] sm:flex"
                  ></img>
                  <div className="relative rounded-[1em] justify-center bg-secondary-400 border-orange-800 text-white border-4 overflow-hidden shadow-xl transition-all my-10 sm:max-w-lg p-7  sm:rounded-[1.5em]">
                    <div>{t('auth.noAccountNeeded')}</div>
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
