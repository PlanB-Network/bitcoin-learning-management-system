import { cn, Image } from '@blms/ui';
import { useTranslation } from 'react-i18next';
import emailIcon from '#src/assets/icons/email.svg';
import { NetworkButton } from './network-button.tsx';
import PageBlock from './page-block.tsx';

interface ContactUsProps {
  text: string;
  email: string;
  className?: string;
}

export const ContactUs = ({ text, email, className = '' }: ContactUsProps) => {
  const { t } = useTranslation();

  return (
    <PageBlock withYPadding={false}>
      <div
        className={cn(
          'w-full mt-15 flex flex-col lg:flex-row px-12 lg:px-24 py-4 lg:py-14 justify-center items-center bg-[#070300] border-[1px] border-orange-900 rounded-[60px] lg:rounded-[100px]',
          className,
        )}
      >
        <Image
          src={emailIcon}
          alt="Email icon"
          breakpoints={{ default: 300 }}
          loading="lazy"
        />
        <div className="max-lg:mt-3 lg:ml-10 max-w-[400px] body-small lg:title-medium max-lg:text-center">
          {text}
        </div>
        <NetworkButton
          variant={'tertiary'}
          className="max-lg:mt-5 lg:ml-14"
          onClick={() => {
            window.open(`mailto:${email}`);
          }}
        >
          {t('words.contactUs')}
        </NetworkButton>
      </div>
    </PageBlock>
  );
};
