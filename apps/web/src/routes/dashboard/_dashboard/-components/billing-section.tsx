import { useTranslation } from 'react-i18next';

import type { Invoice } from '@blms/types';
import { Button, Card } from '@blms/ui';

import { formatDate } from '#src/utils/date.js';

export const BillingSection = ({ invoices }: { invoices: Invoice[] }) => {
  const { t } = useTranslation();

  return (
    <>
      {invoices && (
        <div className="pt-2 md:pt-8">
          <p className="desktop-h6 text-darkOrange-5">
            {t('dashboard.booking.billingTitle')}
          </p>
          <p className="desktop-subtitle1 text-newBlack-4 my-4">
            {t('dashboard.booking.billingSubtitle')}
          </p>
          <div className="w-full flex flex-col md:gap-4 text-newBlack-4">
            {invoices.length > 0 ? (
              <>
                <div className="hidden md:flex flex-row gap-4 font-medium text-newBlack-1">
                  <span className="w-[150px] flex-none">
                    {t('dashboard.booking.invoiceDate')}
                  </span>
                  <span className="w-[100px] flex-none capitalize">
                    {t('dashboard.booking.invoiceType')}
                  </span>
                  <span className="min-w-[100px] grow">
                    {t('dashboard.booking.invoiceTitle')}
                  </span>
                  <span className="w-[100px] flex-none ml-auto">
                    {t('words.invoice')}
                  </span>
                </div>
                {invoices.map((invoice, index) => (
                  <div key={index}>
                    <div className="hidden md:flex flex-row gap-4">
                      <span className="w-[150px] flex-none">
                        {formatDate(invoice.date)}
                      </span>
                      <span className="w-[100px] flex-none capitalize">
                        {invoice.type}
                      </span>
                      <div className="min-w-[100px] grow h-fit">
                        <span className="w-fit bg-newGray-5 pl-4 pr-2 py-1 rounded-full text-black font-medium">
                          {invoice.title}
                        </span>
                      </div>
                      <span className="w-[100px] flex-none ml-auto">
                        <Button
                          variant="newPrimary"
                          size="s"
                          mode="light"
                          disabled
                        >
                          {t('words.download')}
                        </Button>
                      </span>
                    </div>

                    <Card withPadding={false} className="flex md:hidden p-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-newBlack-1 font-medium">
                          {invoice.title}
                        </span>
                        <span className="flex-none  text-sm">
                          {formatDate(invoice.date)} -
                          <span className="capitalize"> {invoice.type}</span>
                        </span>
                        <span className="">
                          <Button variant="newPrimary" size="xs" disabled>
                            {t('dashboard.booking.downloadInvoice')}
                          </Button>
                        </span>
                      </div>
                    </Card>
                  </div>
                ))}
              </>
            ) : (
              <p className="mt-4">{t('dashboard.booking.noInvoice')}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
