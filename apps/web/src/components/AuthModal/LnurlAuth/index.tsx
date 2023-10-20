import {
  BreakPointHooks,
  breakpointsTailwind,
} from '@react-hooks-library/core';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '../../../atoms/Modal';
import { useAppDispatch } from '../../../hooks/use-app-dispatch';
import { userSlice } from '../../../store/slices/user.slice';
import { trpc, trpcClient } from '../../../utils/trpc';
import { AuthModalState } from '../props';

const { useSmaller } = BreakPointHooks(breakpointsTailwind);

interface LnurlAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

export const LnurlAuth = ({ isOpen, onClose, goTo }: LnurlAuthModalProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMobile = useSmaller('md');

  const [lnurl, setLnurl] = useState('');

  useEffect(() => {
    const poll = async () => {
      const me = await trpcClient.auth.lud4.poll.query(undefined, {
        context: {
          // Skip batching for this request so it doesn't block the LNURL fetch
          skipBatch: true,
        },
      });

      dispatch(
        userSlice.actions.login({
          uid: me.uid,
        }),
      );

      onClose();
    };

    const fetchLnurl = async () => {
      const data = await trpcClient.auth.lud4.generate.query();

      setLnurl(data.lnurl);

      poll();
    };

    if (isOpen) {
      fetchLnurl();

      return () => {
        const generateQueryKey = getQueryKey(trpc.auth.lud4.generate);
        queryClient.removeQueries(generateQueryKey);

        const pollQueryKey = getQueryKey(trpc.auth.lud4.poll);
        queryClient.cancelQueries(pollQueryKey);
        queryClient.removeQueries(pollQueryKey);
      };
    }
  }, [isOpen, queryClient, dispatch, onClose]);

  return (
    <Modal
      closeButtonEnabled={isMobile}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('words.lnurlAuth')}
      showAccountHelper={isMobile ? false : true}
    >
      <div className="flex flex-col items-center justify-center py-4">
        {lnurl && (
          <div className="py-6">
            <QRCodeSVG value={lnurl} size={300} />
          </div>
        )}
        <p className="px-10 text-center text-blue-800">
          {t('auth.lnurlAuthDescription')}
        </p>
      </div>
    </Modal>
  );
};
