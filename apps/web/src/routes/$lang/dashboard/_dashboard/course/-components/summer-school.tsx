import {
  Banner,
  BannerDescription,
  BannerTitle,
  Card,
  CollapsibleDropdown,
} from '@blms/ui';
import { t } from 'i18next';
import type { IconType } from 'react-icons/lib';
import { TbCalendarMonth, TbHammer } from 'react-icons/tb';
import BookPixel from '#src/assets/icons/pixelated/book.svg?react';
import CalendarPixel from '#src/assets/icons/pixelated/calendar.svg?react';
import HeartPixel from '#src/assets/icons/pixelated/heart_speaking.svg?react';
import SuccessParty from '#src/assets/icons/success_party.svg?react';
import { fixEmbedUrl } from '#src/components/Markdown/conference-markdown-body.tsx';
import { ReactPlayer } from '#src/components/react-player.tsx';

export const SummerSchool = ({
  courseId,
}: {
  courseId: string;
}) => {
  const paymentDone = false;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <section className="flex flex-col md:mt-8 w-full max-w-[1000px] gap-4 md:gap-8">
        <div className="flex flex-col gap-5">
          <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle !font-bold">
            {t('dashboard.course.summerSchool')}
          </h2>
        </div>
        <div>
          <Banner
            variant="success"
            icon={<SuccessParty className="fill-brightGreen-6" />}
          >
            <BannerTitle>
              Congratulations! You have been selected to participate in the
              Summer School!
            </BannerTitle>
            <BannerDescription className="max-md:hidden">
              You are 1 of the 21 students selected for the exclusive Summer
              School
            </BannerDescription>
          </Banner>
        </div>
      </section>
      {paymentDone ? (
        <CollapsibleDropdown
          title="Overview"
          className="border border-newGray-4"
          variant="dark"
          defaultOpen={true}
        >
          <SummerPresentation />
        </CollapsibleDropdown>
      ) : (
        <SummerPresentation />
      )}
    </div>
  );
};

function SummerPresentation() {
  const videoUrl = 'https://youtu.be/kaePVoEuP00';

  return (
    <section>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="mobile-h3 md:title-large-sb-24px  text-dashboardSectionTitle">
            What to expect
          </h2>
          <div className="flex flex-row gap-4 mt-4 text-center">
            <Card className="w-full border-0">
              <div className="flex flex-col gap-2 items-center">
                <CalendarPixel className="justify-self-center size-11" />
                <p className="text-xl font-medium">6 days all-inclusive</p>
                <div className="text-base flex flex-row gap-2 text-newGray-1 items-center">
                  <TbCalendarMonth />
                  July 20 - 26
                </div>
              </div>
            </Card>
            <Card className="w-full border-0">
              <div className="flex flex-col gap-2 items-center">
                <BookPixel className="justify-self-center size-11 fill-primary" />
                <p className="text-xl font-medium">5 full-day courses</p>
                <div className="text-base flex flex-row gap-2 text-newGray-1 items-center">
                  <TbCalendarMonth />
                  July 21 - 26
                </div>
              </div>
            </Card>
            <Card className="w-full border-0">
              <div className="flex flex-col gap-2 items-center">
                <HeartPixel className="justify-self-center size-11 fill-primary" />
                <p className="text-xl font-medium">
                  Top industry leaders insights & network
                </p>
              </div>
            </Card>
          </div>
        </div>

        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          As well as
        </h2>
        <div className="flex flex-col gap-3 ml-6">
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Hands-on workshops</span>
            <span className=""> to apply what you learn</span>
          </ListElement>
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Collaborative group sessions</span>
            <span className="">to challenge ideas and exchange feedback</span>
          </ListElement>
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Expert-led lectures</span>
            <span className=""> and real-world case studies</span>
          </ListElement>
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Top-tier guest speakers</span>
            <span className="">
              {' '}
              from the Bitcoin industry, every morning and afternoon
            </span>
          </ListElement>
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Strategy deep dives </span>
            <span className="">
              into Bitcoin adoption and business use cases
            </span>
          </ListElement>
        </div>

        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          Beyond the Classroom
        </h2>
        <div className="flex flex-col gap-3 ml-6">
          <ListElement icon={TbHammer}>
            <span className="">Build</span>
            <span className="font-semibold"> lifelong connections </span>
            <span className="">
              with peers and leaders in the Bitcoin space
            </span>
          </ListElement>
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Get inspired </span>
            <span className="">
              , challenge your thinking, and have a ton of fun doing it
            </span>
          </ListElement>
          <ListElement icon={TbHammer}>
            <span className="">Finish off with a</span>
            <span className="font-semibold"> boat trip </span>
            <span className="">on Lake Lugano (July 26)</span>
          </ListElement>
        </div>

        <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          See what previous students experienced
        </h2>
        <div className="relative pt-[56.25%]">
          <ReactPlayer
            height={'100%'}
            width={'100%'}
            style={{ position: 'absolute', top: 0, left: 0 }}
            className="mb-2 rounded-lg"
            controls={true}
            url={fixEmbedUrl(videoUrl)}
          />
        </div>
      </div>
    </section>
  );
}

function ListElement({
  icon,
  children,
}: { icon: IconType; children: React.ReactNode }) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-4">
      <Icon className="size-8 text-darkOrange-3" />
      <p className="text-xl">{children}</p>
    </div>
  );
}
