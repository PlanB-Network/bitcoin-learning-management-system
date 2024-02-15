import { useTranslation } from 'react-i18next';

import ProfessorsTile from '../../../assets/home/professors.webp';
import { Button } from '../../../atoms/Button';
import { MainLayout } from '../../../components/MainLayout';

export const About = () => {
  const { t } = useTranslation();

  return (
    <MainLayout footerVariant="dark">
      <div className="flex flex-col items-center">
        <div className="mx-8 mt-24 flex max-w-4xl flex-col items-center">
          <h1 className="text-3xl font-semibold uppercase text-orange-500">
            {t('about.title')}
          </h1>
          <p className="uppercase">{t('about.subtitle')}</p>
        </div>

        <div className="grid max-w-3xl grid-cols-3">
          <div className="col-span-2 self-start">
            <div>
              <h2 className="mt-12 text-3xl font-semibold uppercase text-orange-500">
                {t('about.missionTitle')}
              </h2>
              <p className="mt-2 text-gray-400">{t('about.missionContent1')}</p>
              <p className="mt-2 text-gray-400">{t('about.missionContent2')}</p>
            </div>
            <div>
              <h2 className="mt-12 text-3xl font-semibold uppercase text-orange-500">
                {t('about.commitmentTitle')}
              </h2>
              <p className="mt-2 whitespace-pre-line text-gray-400">
                {t('about.commitmentContent')}
              </p>
            </div>
            <div>
              <h2 className="mt-12 text-3xl font-semibold uppercase text-orange-500">
                {t('about.storyTitle')}
              </h2>
              <p className="mt-2 whitespace-pre-line text-gray-400">
                {t('about.storyContent')}{' '}
                <a
                  className="inline"
                  href="https://youtu.be/niKsUKrV4pU?si=0H9jLJBteDmlsOaH"
                >
                  https://youtu.be/niKsUKrV4pU?si=0H9jLJBteDmlsOaH
                </a>
              </p>
            </div>
          </div>
          <div className="col-span-1">LOGO</div>
        </div>

        <div className="mt-12 w-full max-w-3xl self-center">
          <Button variant="tertiary" className="self-start" glowing={true}>
            Read our manifesto
          </Button>
        </div>

        <div className="mt-12 max-w-[80rem]">
          <img
            src={ProfessorsTile}
            className="mt-4 w-full 2xl:px-28"
            alt={t('')}
            loading="lazy"
          />
        </div>
      </div>
    </MainLayout>
  );
};
