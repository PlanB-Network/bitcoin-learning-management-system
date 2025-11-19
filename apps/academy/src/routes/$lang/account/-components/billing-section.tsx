import type { Invoice } from '@blms/types';
import { Card, EmptyState } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import { TbFileInvoice } from 'react-icons/tb';
import { formatDate } from '#src/utils/date.js';

export const BillingSection = ({ invoices }: { invoices: Invoice[] }) => {
  const { t } = useTranslation();

  const sortedInvoices = invoices.sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  return (
    <>
      {invoices && (
        <div className="w-full flex flex-col gap-2.5 md:gap-4 text-newBlack-4">
          {sortedInvoices.length > 0 ? (
            <>
              <div className="hidden md:flex flex-row gap-4 font-medium text-newBlack-1">
                <span className="w-[150px] flex-none">
                  {t('dashboard.booking.invoiceDate')}
                </span>
                <span className="w-25 flex-none capitalize">
                  {t('dashboard.booking.invoiceType')}
                </span>
                <span className="min-w-25 grow">
                  {t('dashboard.booking.invoiceTitle')}
                </span>
                <span className="w-25 flex-none ml-auto">
                  {t('words.invoice')}
                </span>
              </div>
              {sortedInvoices.map((invoice, index) => {
                function DlInvoice({ invoice }: { invoice: Invoice }) {
                  switch (invoice.paymentMethod) {
                    case 'free': {
                      return <span>{t('words.unavailable')}</span>;
                    }
                    case 'sbp': {
                      return <span>{t('words.unavailable')}</span>;
                    }
                    case 'stripe': {
                      return (
                        <a
                          className="underline underline-offset-2 hover:text-darkOrange-5"
                          href={invoice.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t('words.access')}
                        </a>
                      );
                    }
                  }
                }

                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: explanation
                  <div key={index}>
                    <div className="hidden md:flex flex-row gap-4">
                      <span className="w-[150px] flex-none">
                        {formatDate(invoice.date)}
                      </span>
                      <span className="w-25 flex-none capitalize">
                        {invoice.type}
                      </span>
                      <div className="min-w-25 grow h-fit">{invoice.title}</div>
                      <span className="w-25 flex-none ml-auto">
                        <DlInvoice invoice={invoice} />
                      </span>
                    </div>

                    <Card
                      withPadding={false}
                      className="flex md:hidden p-3"
                      color="gray"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-newBlack-1 font-medium">
                          {invoice.title}
                        </span>
                        <span className="flex-none  text-sm">
                          {formatDate(invoice.date)} -
                          <span className="capitalize"> {invoice.type}</span>
                        </span>
                        <span className="">
                          <DlInvoice invoice={invoice} />
                        </span>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </>
          ) : (
            <EmptyState
              title={t('dashboard.booking.noInvoice')}
              icon={TbFileInvoice}
              className="mt-4"
            />
          )}
        </div>
      )}
    </>
  );
};
