import { useTranslation } from 'react-i18next';

import Corporates from '../../../assets/about/corporates.webp';
import PlanBCircles from '../../../assets/about/planb_circles.webp';
import PpAjelex from '../../../assets/people/ajelex.webp';
import PpAsi0 from '../../../assets/people/asi0.webp';
import PpDavid from '../../../assets/people/david.webp';
import PpFanis from '../../../assets/people/fanis.webp';
import PpGiacomo from '../../../assets/people/giacomo.webp';
import PpGibson from '../../../assets/people/gibson.webp';
import PpJim from '../../../assets/people/jim.webp';
import PpLoic from '../../../assets/people/loic.webp';
import PpPierre from '../../../assets/people/pierre.webp';
import PpRogzy from '../../../assets/people/rogzy.webp';
import PpTheom from '../../../assets/people/theo_m.webp';
import PpTheop from '../../../assets/people/theo_p.webp';
import PpTodd from '../../../assets/people/todd.webp';
import { Button } from '../../../atoms/Button';
import { MainLayout } from '../../../components/MainLayout';
import { AboutUs } from '../../../molecules/AboutUs';
import { Person } from '../../../molecules/Person';

const Title = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-8 mt-24 flex max-w-4xl flex-col items-center">
      <h1 className="text-4xl font-semibold uppercase text-orange-500">
        {t('about.title')}
      </h1>
      <p className="uppercase">{t('about.subtitle')}</p>
    </div>
  );
};

const Mission = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="col-span-1 self-start">
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
        <div className="col-span-1 mt-32 hidden max-w-md lg:block">
          <img
            src={PlanBCircles}
            className="mt-4 w-full"
            alt={t('')}
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-12 w-full max-w-3xl self-center">
        <Button variant="tertiary" className="self-start" glowing={true}>
          Read our manifesto
        </Button>
      </div>
    </>
  );
};

const Corporate = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-12 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-semibold uppercase text-orange-500">
          {t('about.corporateTitle')}
        </h2>
        <p className="mt-2 text-gray-400">{t('about.corporateContent')}</p>
        <p className="mt-2">
          {t('about.coportateContact')}{' '}
          <a href="mailto:contact@planb.network">contact@planb.network</a>
        </p>
      </div>
      <div className="mx-auto px-16">
        <img
          src={Corporates}
          className="mt-4 w-full max-w-md"
          alt={t('')}
          loading="lazy"
        />
      </div>
    </div>
  );
};

const CoreTeam = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mt-12 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold uppercase text-orange-500">
            {t('about.coreTeamTitle')}
          </h2>
          <p className="mt-2 text-gray-400">{t('about.coreTeamContent')}</p>
        </div>
      </div>
      <div className="mt-6 grid w-full max-w-5xl grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Person
            name="Giacomo"
            job={t('about.coreTeamGiacomoRole')}
            picture={PpGiacomo}
          />
          <Person
            name="Asi0"
            job={t('about.coreTeamAsioRole')}
            picture={PpAsi0}
          />
        </div>
        <div className="flex flex-col gap-6">
          <Person
            name="Rogzy"
            job={t('about.coreTeamRogzyRole')}
            picture={PpRogzy}
          />
          <Person
            name="Ajelex"
            job={t('about.coreTeamAjelexRole')}
            picture={PpAjelex}
          />
        </div>
      </div>
    </>
  );
};

const Professors = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-12 flex w-full max-w-5xl  gap-6">
      <div>
        <h2 className="text-3xl font-semibold uppercase text-orange-500">
          {t('words.professors')}
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <img
            className="w-24 rounded-lg"
            src={PpFanis}
            alt=""
            loading="lazy"
          />
          <img className="w-24 rounded-lg" src={PpJim} alt="" loading="lazy" />
          <img className="w-24 rounded-lg" src={PpLoic} alt="" loading="lazy" />
          <img
            className="w-24 rounded-lg"
            src={PpTheom}
            alt=""
            loading="lazy"
          />
          <img
            className="w-24 rounded-lg"
            src={PpDavid}
            alt=""
            loading="lazy"
          />
          <img
            className="w-24 rounded-lg"
            src={PpPierre}
            alt=""
            loading="lazy"
          />
          <img
            className="w-24 rounded-lg"
            src={PpGibson}
            alt=""
            loading="lazy"
          />
          <img
            className="w-24 rounded-lg"
            src={PpTheop}
            alt=""
            loading="lazy"
          />
          <img className="w-24 rounded-lg" src={PpTodd} alt="" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

export const About = () => {
  return (
    <MainLayout footerVariant="dark">
      <div className="flex flex-col items-center px-4">
        <Title />
        <Mission />
        <div className="mt-12 max-w-[70rem]">
          <AboutUs />
        </div>
        <Corporate />
        <CoreTeam />
        <Professors />
      </div>
    </MainLayout>
  );
};
