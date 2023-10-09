import { useTranslation } from 'react-i18next';

import rabbitWithBook from '../../../../assets/rabbit-with-book.svg';

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
    <div className="flex h-12 flex-row items-center sm:h-max">
      <h1 className="mx-2 mb-1 mt-2 w-max bg-orange-400 p-2 text-xl font-bold uppercase text-white sm:mx-8 sm:mt-4 sm:p-4 sm:text-2xl lg:text-4xl 2xl:text-6xl">
        {children}
      </h1>
      <img
        src={rabbitWithBook}
        alt={t('imagesAlt.readingRabbit')}
        className="ml-4 h-full sm:ml-8"
      ></img>
    </div>
  );
};
