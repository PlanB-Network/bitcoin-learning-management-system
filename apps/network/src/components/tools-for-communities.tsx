import { cn } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import communityImg from '#src/assets/community/community-img.png';
import communityLogo from '#src/assets/community/community-logo.png';
import eventsImg from '#src/assets/community/events-img.png';
import eventsLogo from '#src/assets/community/events-logo.svg';
import languageImg from '#src/assets/community/language-img.png';
import languageLogo from '#src/assets/community/language-logo.svg';
import resourceImg from '#src/assets/community/resource-img.png';
import resourceLogo from '#src/assets/community/resource-logo.svg';
import safeButtonsImage from '#src/assets/community/safe-buttons.png';
import safeImg from '#src/assets/community/safe-img.png';
import safeLogo from '#src/assets/community/safe-logo.svg';
import testImg from '#src/assets/community/test-img.png';
import testLogo from '#src/assets/community/test-logo.svg';
import BlockTitle from './block-title.tsx';
import PageBlock from './page-block.tsx';

type ToolsForCommunitiesProps = {
  className?: string;
};

export default function ToolsForCommunities({
  className,
}: ToolsForCommunitiesProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('', className)}>
      <BlockTitle
        text={t('community.title')}
        subtext={t('community.subtitle')}
      />

      <PageBlock>
        <div className="flex max-lg:flex-col flex-wrap gap-5 lg:justify-center items-center">
          <BlockOne />
          <BlockTwo />
          <BlockThree />
          <BlockFour />
          <BlockFive />
          <BlockSix />
        </div>
      </PageBlock>
    </div>
  );
}

function BlockOne() {
  const { t } = useTranslation();

  return (
    <Link
      to={
        'https://planb.academy/en/courses/create-a-bitcoin-community-or-meet-up-1c643dc9-a15f-4f9e-93b6-cb3c58b4ee35'
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="h-fit px-4 flex flex-col border-1 border-orange-500 rounded-[40px] max-w-[500px] xl:max-w-[650px] bg-[#100600] hover:bg-[#3F1700]">
        <div className="mt-5 lg:mt-10 flex flex-row w-full gap-6 ml-5">
          <img
            className="max-lg:h-16 object-cover "
            src={communityLogo}
            alt=""
          />
          <div className="flex flex-col gap-4 title-large max-w-[350px]">
            <span>
              <Trans i18nKey="community.box1Title">
                <span className="text-orange-500">Building</span>
              </Trans>
            </span>
            <span className="max-lg:hidden title-small text-gray-200">
              {t('community.box1Subtitle')}
            </span>
          </div>
        </div>
        <span className="lg:hidden my-5 body-12px-small text-gray-200 ">
          {t('community.box1Subtitle')}
        </span>
        <img className="lg:mt-5 rounded-4xl" src={communityImg} alt="" />
      </div>
    </Link>
  );
}

function BlockTwo() {
  const { t } = useTranslation();

  return (
    <Link
      to={
        'https://github.com/PlanB-Network/bitcoin-educational-content#join-the-proofreading-team'
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="px-4 flex flex-col border-1 border-blue-400 rounded-[40px] max-w-[500px] xl:max-w-[550px] bg-blue-950 hover:bg-[#032042]">
        <div className="mt-5 lg:mt-10 flex flex-row w-full gap-6 ml-5">
          <img
            className="max-lg:h-16 object-cover "
            src={languageLogo}
            alt=""
          />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box2Title">
                <span className="text-blue-400">own language</span>
              </Trans>
            </span>
          </div>
        </div>
        <span className="my-5 body-12px-small lg:title-small text-gray-200 lg:max-w-[400px] lg:ml-10 ">
          {t('community.box2Subtitle')}
        </span>
        <img className="lg:mt-5 rounded-4xl" src={languageImg} alt="" />
      </div>
    </Link>
  );
}

function BlockThree() {
  return (
    <Link
      to={'https://planb.academy/resources'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="xl:-translate-y-20 px-4 flex flex-col border-1 border-yellow-4 rounded-[40px] max-w-[500px] xl:max-w-[550px] bg-[#1B1000] hover:bg-[#402704]">
        <div className="mt-5 lg:mt-10 flex flex-row w-full gap-6 ml-5">
          <img
            className="max-lg:h-16 object-cover "
            src={resourceLogo}
            alt=""
          />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box3Title">
                <span className="text-yellow-4">tools and resources</span>
              </Trans>
            </span>
          </div>
        </div>
        <img
          className="mt-10 rounded-4xl translate-x-4 w-fit"
          src={resourceImg}
          alt=""
        />
      </div>
    </Link>
  );
}

function BlockFour() {
  const { t } = useTranslation();

  return (
    <Link
      to={'https://planb.academy/events'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="px-4 flex flex-col border-1 border-purple-400 rounded-[40px] max-w-[500px] xl:max-w-[550px] bg-purple-950 hover:bg-[#3B0746]">
        <div className="mt-5 lg:mt-10 flex flex-row w-full gap-6 ml-5">
          <img className="max-lg:h-16 object-cover " src={eventsLogo} alt="" />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box4Title">
                <span className="text-purple-400">visibility</span>
              </Trans>
            </span>
            <span className="max-lg:hidden title-small text-gray-200">
              {t('community.box4Subtitle')}
            </span>
          </div>
        </div>
        <span className="lg:hidden my-5 body-12px-small text-gray-200 ">
          {t('community.box4Subtitle')}
        </span>
        <img className="lg:mt-5 rounded-4xl" src={eventsImg} alt="" />
      </div>
    </Link>
  );
}

function BlockFive() {
  return (
    <Link
      to={'https://planb.academy'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="px-4 flex flex-col border-1 border-green-400 rounded-[40px] max-w-[500px] xl:max-w-[550px] bg-[#001700] hover:bg-[#002600]">
        <div className="mt-5 lg:mt-10 flex flex-row w-full gap-6 ml-5">
          <img className="max-lg:h-16 object-cover " src={safeLogo} alt="" />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box5Title">
                <span className="text-green-400">safe place</span>
              </Trans>
            </span>
          </div>
        </div>
        <div className="flex flex-row pr-10 pl-7">
          <div className="w-[50%]">
            <img className="mt-10 w-full" src={safeButtonsImage} alt="" />
          </div>
          <div className="w-[50%]">
            <img
              className="mt-10 rounded-4xl translate-x-4 w-full"
              src={safeImg}
              alt=""
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlockSix() {
  const { t } = useTranslation();

  return (
    <Link
      to={'https://planb.academy/en/certifications/b-cert'}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="px-4 flex flex-col border-1 border-orange-500 rounded-[40px] max-w-[500px] xl:max-w-[550px] bg-[#100600] hover:bg-orange-950">
        <div className="mt-5 lg:mt-10 flex flex-row w-full gap-6 ml-5">
          <img className="max-lg:h-16 object-cover " src={testLogo} alt="" />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box6Title">
                <span className="text-orange-500">Bitcoin test</span>
              </Trans>
            </span>
          </div>
        </div>
        <div className="flex flex-row pr-10 pl-7">
          <div className="w-[50%]">
            <span className="title-small text-gray-200">
              {t('community.box6Subtitle')}
            </span>
          </div>
          <div className="w-[50%]">
            <img
              className="mt-10 rounded-4xl translate-x-4 w-full"
              src={testImg}
              alt=""
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
