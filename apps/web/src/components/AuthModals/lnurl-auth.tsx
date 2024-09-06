import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog } from '@blms/ui';

import { trpc, trpcClient } from '../../utils/trpc.ts';

import type { AuthModalState } from './props.ts';

interface LnurlAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  goTo: (newState: AuthModalState) => void;
}

export const LnurlAuth = ({ isOpen, onClose }: LnurlAuthModalProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  // const isMobile = useSmaller('md');

  const [lnurl, setLnurl] = useState('');

  useEffect(() => {
    const poll = async () => {
      // TODO fix lnurl
      const me = await trpcClient.auth.lud4.poll.query(undefined, {
        context: {
          // Skip batching for this request so it doesn't block the LNURL fetch
          skipBatch: true,
        },
      });

      console.log(me);
      // dispatch(
      //   userSlice.actions.login({
      //     uid: me.uid,
      //   }),
      // );

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
        queryClient.removeQueries({ queryKey: generateQueryKey });

        const pollQueryKey = getQueryKey(trpc.auth.lud4.poll);
        queryClient.cancelQueries({ queryKey: pollQueryKey });
        queryClient.removeQueries({ queryKey: pollQueryKey });
      };
    }
  }, [isOpen, queryClient, onClose]);

  return (
    <Dialog
      // closeButtonEnabled={isMobile ? isMobile : false}
      open={isOpen}
      // onClose={onClose}
      // headerText={t('words.lnurlAuth')}
      // showAccountHelper={isMobile ? false : true}
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
    </Dialog>
  );
};
