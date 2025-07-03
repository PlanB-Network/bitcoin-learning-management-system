import { cn, customToast, ScrollToTopButton } from '@blms/ui';
import { type JSX, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';
import { Footer } from './footer.tsx';
import { Header } from './Header/header.tsx';

interface MainLayoutProps {
  children: JSX.Element | JSX.Element[];
  variant?: 'light' | 'dark' | 'gray';
  showFooter?: boolean;
  headerVariant?: 'light' | 'dark';
  footerVariant?: 'light' | 'dark';
}

export const MainLayout = ({
  children,
  variant = 'dark',
  showFooter = true,
  footerVariant,
  headerVariant,
}: MainLayoutProps) => {
  const { t } = useTranslation();
  const box = useRef<HTMLDivElement | null>(null);

  const bgColorClasses = {
    blue: 'bg-blue-200',
    dark: 'bg-black',
    gray: 'bg-newGray-6',
    light: 'bg-white',
  };

  // using session storage to check if user just registered and show toast
  useEffect(() => {
    const hasJustRegistered = sessionStorage.getItem('hasJustRegistered');

    if (hasJustRegistered) {
      customToast(t('auth.dashboardUnlocked'), {
        closeButton: true,
        color: 'primary',
        imgSrc: SignInIconLight,
        mode: variant === 'dark' ? 'dark' : 'light',
        onClick: () => {
          window.location.href = '/dashboard/courses';
        },
        time: 5000,
      });

      sessionStorage.removeItem('hasJustRegistered');
    }
  }, []);

  return (
    <div
      className={cn(
        'text-white flex flex-col min-h-dvh',
        bgColorClasses[variant],
      )}
      ref={box}
    >
      {/* Header */}
      <Header
        variant={headerVariant}
        notificationPanelVariant={variant === 'dark' ? 'dark' : 'light'}
      />

      {/* Content */}
      <main className="flex grow flex-col">{children}</main>

      {/* Footer */}
      {showFooter && <Footer variant={footerVariant} />}

      <ScrollToTopButton />
    </div>
  );
};
