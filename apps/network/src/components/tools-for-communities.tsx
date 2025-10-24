import { cn, Image } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { Trans, useTranslation } from 'react-i18next';
import communityImg from '#src/assets/community/community-img.webp';
import communityLogo from '#src/assets/community/community-logo.png';
import eventsImg from '#src/assets/community/events-img2.webp';
import eventsLogo from '#src/assets/community/events-logo.svg';
import languageImg from '#src/assets/community/language-img.webp';
import languageLogo from '#src/assets/community/language-logo.svg';
import resourceImg from '#src/assets/community/resource-img.webp';
import resourceLogo from '#src/assets/community/resource-logo.svg';
import safeButtonsImage from '#src/assets/community/safe-buttons.png';
import safeImg from '#src/assets/community/safe-img.webp';
import safeLogo from '#src/assets/community/safe-logo.svg';
import testImg from '#src/assets/community/test-img.webp';
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
      <PageBlock
        withXMargin={false}
        withXPadding={false}
        className="max-w-[1400px] mx-auto"
      >
        <div className="flex flex-row max-lg:flex-col lg:flex-wrap gap-x-10 gap-y-10 lg:justify-center max-lg:items-center w-full lg:-mb-30">
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
      className="max-lg:w-full flex"
    >
      <div className="h-fit w-full mx-2 px-4 flex flex-col border-1 border-orange-500 rounded-[40px] lg:max-w-[550px] xl:max-w-[670px] bg-[#100600] hover:bg-[#3F1700]">
        <div className="mt-5 lg:mt-8 flex flex-row w-full gap-6 pl-5">
          <Image
            className="max-lg:h-16 object-cover "
            src={communityLogo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 500 }}
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
        <Image
          className="lg:mt-5 rounded-4xl rounded-b-3xl"
          src={communityImg}
          alt=""
          loading="lazy"
          breakpoints={{ default: 1000 }}
        />
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
      className="max-lg:w-full flex"
    >
      <div className="w-full mx-2 px-4 flex flex-col border-1 border-blue-400 rounded-[40px] lg:max-w-[387px] xl:max-w-[507px] bg-blue-950 hover:bg-[#032042]">
        <div className="mt-5 lg:mt-8 flex flex-row w-full gap-6 px-4">
          <Image
            className="max-lg:h-16 object-cover "
            src={languageLogo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 500 }}
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
        <Image
          className="lg:mt-5 rounded-t-4xl"
          src={languageImg}
          alt=""
          loading="lazy"
          breakpoints={{ default: 1000 }}
        />
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
      className="max-lg:w-full flex h-fit lg:-translate-y-30"
    >
      <div className="w-full mx-2 flex flex-col border-1 border-yellow-4 rounded-[40px] lg:max-w-[450px] xl:max-w-[530px] bg-[#1B1000] hover:bg-[#402704]">
        <div className="px-4 mt-5 lg:mt-8 flex flex-row w-full gap-6">
          <Image
            className="max-lg:h-16 object-cover "
            src={resourceLogo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 500 }}
          />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box3Title">
                <span className="text-yellow-4">tools and resources</span>
              </Trans>
            </span>
          </div>
        </div>
        <Image
          className="mt-10 rounded-4xl w-fit pl-8"
          src={resourceImg}
          alt=""
          loading="lazy"
          breakpoints={{ default: 1000 }}
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
      className="max-lg:w-full flex h-fit"
    >
      <div className="w-full pt-2 h-fit mx-2 flex flex-col border-1 border-purple-400 rounded-[40px] lg:max-w-[480px] xl:max-w-[595px] bg-purple-950 hover:bg-[#3B0746]">
        <div className="px-4 mt-5 lg:mt-8 flex flex-row w-full gap-6">
          <Image
            className="max-lg:h-16"
            src={eventsLogo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 500 }}
          />
          <div className="flex flex-col gap-4 title-large">
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
        <span className="lg:hidden px-5 my-5 body-12px-small text-gray-200 ">
          {t('community.box4Subtitle')}
        </span>
        <Image
          className="lg:mt-5 rounded-4xl  pl-20 pr-15"
          src={eventsImg}
          alt=""
          loading="lazy"
          breakpoints={{ default: 1000 }}
        />
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
      className="max-lg:w-full flex lg:-translate-y-30"
    >
      <div className="w-full mx-2 px-6 flex flex-col border-1 border-green-400 rounded-[40px] lg:max-w-[414px] xl:max-w-[534px] bg-[#001700] hover:bg-[#002600]">
        <div className="mt-5 lg:mt-8 flex flex-row w-full gap-6 px-4">
          <Image
            className="max-lg:h-16 object-cover "
            src={safeLogo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 500 }}
          />
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
            <Image
              className="mt-10 w-full"
              src={safeButtonsImage}
              alt=""
              loading="lazy"
              breakpoints={{ default: 1000 }}
            />
          </div>
          <div className="w-[50%]">
            <Image
              className="rounded-t-4xl translate-x-4 w-full"
              src={safeImg}
              alt=""
              loading="lazy"
              breakpoints={{ default: 1000 }}
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
      className="max-lg:w-full flex lg:-translate-y-30"
    >
      <div className="w-full h-fit pb-2 mx-2 pr-6 flex flex-col gap-6 border-1 border-orange-500 rounded-[40px] lg:max-w-[480px] xl:max-w-[600px] bg-[#100600] hover:bg-orange-950">
        <div className="mt-5 lg:mt-8 flex flex-row w-full gap-6 px-5">
          <Image
            className="max-lg:h-16 object-cover "
            src={testLogo}
            alt=""
            loading="lazy"
            breakpoints={{ default: 500 }}
          />
          <div className="flex flex-col gap-4 title-large max-w-[330px]">
            <span>
              <Trans i18nKey="community.box6Title">
                <span className="text-orange-500">Bitcoin test</span>
              </Trans>
            </span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row pl-7 justify-items-center items-center lg:items-start max-lg:gap-4">
          <p className="title-small text-gray-200 lg:w-[50%]">
            {t('community.box6Subtitle')}
          </p>
          <Image
            className="lg:w-[50%] pl-4 pb-3"
            src={testImg}
            alt=""
            loading="lazy"
            breakpoints={{ default: 1000 }}
          />
        </div>
      </div>
    </Link>
  );
}
