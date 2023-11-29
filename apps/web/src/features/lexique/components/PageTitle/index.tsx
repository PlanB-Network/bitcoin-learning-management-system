import { useTranslation } from 'react-i18next';

interface PageTitleProps {
  children?: string;
  variant?: 'primary' | 'alternate';
}

export const PageTitle = ({ children, variant }: PageTitleProps) => {
  const { t } = useTranslation();
  if (variant === 'alternate')
    return (
      <h1 className="my-8 ml-24 w-96 border-b-4 border-solid border-b-blue-800 text-5xl font-bold uppercase leading-tight text-blue-800">
        {children}
      </h1>
    );

  return (
    <div className="w-full bg-transparent flex flex-wrap md:items-end lg:space-x-3.5 space-y-4">
      <h1 className="text-5xl font-bold text-white bg-orange-500 p-[3px]">
        {t('lexique.title')}
      </h1>
      <span className="text-orange-500 text-base uppercase  mb-1">
        {t('lexique.headerThanksText')}
      </span>
      <button className="btn bg-red-300 text-white p-2 px-3 rounded-sm z-10 shadow-lg">
        D
      </button>
      <span className="italic uppercase font-extralight">
        {t('lexique.headerHelp')}
      </span>
    </div>
  );
};
