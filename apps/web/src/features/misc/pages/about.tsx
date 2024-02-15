import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import Corporates from '../../../assets/about/corporates.webp';
import PlanBCircles from '../../../assets/about/planb_circles.webp';
import PpAjelex from '../../../assets/people/ajelex.webp';
import PpAsi0 from '../../../assets/people/asi0.webp';
import Ct01 from '../../../assets/people/contributors/01.png';
import Ct02 from '../../../assets/people/contributors/02.png';
import Ct03 from '../../../assets/people/contributors/03.png';
import Ct04 from '../../../assets/people/contributors/04.png';
import Ct05 from '../../../assets/people/contributors/05.png';
import Ct06 from '../../../assets/people/contributors/06.png';
import Ct07 from '../../../assets/people/contributors/07.png';
import Ct08 from '../../../assets/people/contributors/08.png';
import Ct09 from '../../../assets/people/contributors/09.png';
import Ct10 from '../../../assets/people/contributors/10.png';
import Ct11 from '../../../assets/people/contributors/11.png';
import Ct12 from '../../../assets/people/contributors/12.png';
import Ct13 from '../../../assets/people/contributors/13.png';
import Ct14 from '../../../assets/people/contributors/14.png';
import Ct15 from '../../../assets/people/contributors/15.png';
import Ct16 from '../../../assets/people/contributors/16.png';
import Ct17 from '../../../assets/people/contributors/17.png';
import Ct18 from '../../../assets/people/contributors/18.png';
import Ct19 from '../../../assets/people/contributors/19.png';
import Ct20 from '../../../assets/people/contributors/20.png';
import Ct21 from '../../../assets/people/contributors/21.png';
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

      <div className="mt-12 w-full max-w-5xl self-center">
        <Link to={'/manifesto'}>
          <Button variant="tertiary" className="self-start" glowing={true}>
            Read our manifesto
          </Button>
        </Link>
      </div>
    </>
  );
};

const Corporate = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-20 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
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

const ActiveContributors = () => {
  const { t } = useTranslation();
  const css = 'w-24 h-24 rounded-lg';

  return (
    <div className="mt-12 flex w-full max-w-5xl flex-col gap-4">
      <h2 className="text-3xl font-semibold uppercase text-orange-500">
        {t('about.activeContributors')}
      </h2>
      <div className="flex w-full max-w-4xl flex-wrap justify-center gap-4 place-self-center">
        <img className={css} src={Ct01} alt="" loading="lazy" />
        <img className={css} src={Ct02} alt="" loading="lazy" />
        <img className={css} src={Ct03} alt="" loading="lazy" />
        <img className={css} src={Ct04} alt="" loading="lazy" />
        <img className={css} src={Ct05} alt="" loading="lazy" />
        <img className={css} src={Ct06} alt="" loading="lazy" />
        <img className={css} src={Ct07} alt="" loading="lazy" />
        <img className={css} src={Ct08} alt="" loading="lazy" />
        <img className={css} src={Ct09} alt="" loading="lazy" />
        <img className={css} src={Ct10} alt="" loading="lazy" />
        <img className={css} src={Ct11} alt="" loading="lazy" />
        <img className={css} src={Ct12} alt="" loading="lazy" />
        <img className={css} src={Ct13} alt="" loading="lazy" />
        <img className={css} src={Ct14} alt="" loading="lazy" />
        <img className={css} src={Ct15} alt="" loading="lazy" />
        <img className={css} src={Ct16} alt="" loading="lazy" />
        <img className={css} src={Ct17} alt="" loading="lazy" />
        <img className={css} src={Ct18} alt="" loading="lazy" />
        <img className={css} src={Ct19} alt="" loading="lazy" />
        <img className={css} src={Ct20} alt="" loading="lazy" />
        <img className={css} src={Ct21} alt="" loading="lazy" />
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
        <ActiveContributors />
      </div>
    </MainLayout>
  );
};
