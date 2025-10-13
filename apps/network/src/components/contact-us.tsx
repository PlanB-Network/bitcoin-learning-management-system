import { Button, cn } from '@blms/ui';
import { t } from 'i18next';
import emailIcon from '#src/assets/icons/email.svg';
import PageBlock from './page-block.tsx';

interface ContactUsProps {
  text: string;
  email: string;
  className?: string;
}

export const ContactUs = ({ text, email, className = '' }: ContactUsProps) => {
  return (
    <PageBlock>
      {/*  */}
      <div
        className={cn(
          'flex flex-col lg:flex-row px-24 py-4 lg:py-14 justify-center items-center bg-[#070300] border-[1px] border-orange-900 rounded-[100px]',
          className,
        )}
      >
        <img src={emailIcon} alt="Email icon" />
        <div className="max-lg:mt-3 lg:ml-10 max-w-[400px] body-small lg:title-medium max-lg:text-center">
          {text}
        </div>
        <Button
          variant={'ghost'}
          className="max-lg:mt-5 lg:ml-14 border-[1px] border-orange-500 h-16"
          rounded={true}
          onClick={() => {
            window.open(`mailto:${email}`);
          }}
          size={'l'}
        >
          {t('words.contactUs')}
        </Button>
      </div>
    </PageBlock>
  );
};
