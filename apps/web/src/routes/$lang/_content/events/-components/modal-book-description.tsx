import { t } from 'i18next';

import { Button, Checkbox } from '@blms/ui';

import PlanBLogo from '#src/assets/logo/planb_logo_horizontal_black.svg?react';
import { PaymentCallout } from '#src/components/payment-callout.js';

import { type JSX, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ModalBookDescriptionProps {
  accessType: 'physical' | 'online' | 'replay';
  callout: string;
  description: string;
  isGdprCompliance: boolean;
  gdprTerms: string;
  onBooked: () => void;
  children?: JSX.Element | JSX.Element[];
}

export const ModalBookDescription = ({
  accessType,
  callout,
  description,
  isGdprCompliance,
  gdprTerms,
  onBooked,
  children,
}: ModalBookDescriptionProps) => {
  const splitDescription =
    description.includes('\n') && description.split('\n');

  const [isBookEnabled, setIsBookEnabled] = useState(!isGdprCompliance);
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  return (
    <div className="items-center justify-center w-full max-w-96 lg:w-96 flex flex-col gap-6 max-lg:pb-6 max-lg:pt-8">
      <PlanBLogo className="h-auto max-lg:hidden" width={240} />
      <PaymentCallout description={callout} />
      <div className="w-full flex flex-col">
        {splitDescription ? (
          splitDescription.map((desc) => (
            <p className="text-sm max-lg:text-center" key={desc}>
              {desc}
            </p>
          ))
        ) : (
          <p className="text-sm max-lg:text-center">{description}</p>
        )}
      </div>
      {accessType === 'physical' && (
        <p className="w-full text-sm max-lg:text-center">
          {t('events.payment.additional_free_description')}
        </p>
      )}
      {children}

      {isGdprCompliance ? (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            className="self-start mt-[2px]"
            checked={isBookEnabled}
            onCheckedChange={(e: boolean) => {
              setIsBookEnabled(e);
              console.log(e);
            }}
          />
          <label htmlFor="terms" className="text-sm">
            <ReactMarkdown
              components={{
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    className=" text-darkOrange-5 "
                    rel="noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {gdprTerms}
            </ReactMarkdown>
          </label>
        </div>
      ) : null}

      {!isBookEnabled && isBtnClicked ? (
        <p className="text-red-6 text-sm self-start">
          {t('events.tcMustBeAccepter')}
        </p>
      ) : null}

      <Button
        variant="primary"
        className="lg:w-full"
        onClick={() => {
          setIsBtnClicked(true);
          if (isBookEnabled) {
            onBooked();
          }
        }}
      >
        {t('events.payment.book_seat')}
      </Button>
    </div>
  );
};
