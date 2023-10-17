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

  const { data } = trpc.auth.lud4.generate.useQuery();

  useEffect(() => {
    if (isOpen) {
      console.log('invalidating');
      const queryKey = getQueryKey(trpc.auth.lud4.generate);
      queryClient.resetQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
    }
  }, [isOpen, queryClient]);

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

    poll();
  }, [data, dispatch, onClose]);

  return (
    <Modal
      closeButtonEnabled={isMobile}
      isOpen={isOpen}
      onClose={onClose}
      headerText={t('words.signIn')}
      showAccountHelper
    >
      <div className="flex flex-col items-center">
        {data && (
          <div>
            <QRCodeSVG value={data.lnurl} size={300} />
          </div>
        )}
      </div>
    </Modal>
  );
};
