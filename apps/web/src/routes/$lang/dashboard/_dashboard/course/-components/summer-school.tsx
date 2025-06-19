import { GeneralPaymentItem } from '@blms/constants';
import {
  Banner,
  BannerDescription,
  BannerTitle,
  Button,
  Card,
  CollapsibleDropdown,
  DividerSimple,
} from '@blms/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { useContext, useEffect, useMemo, useState } from 'react';
import type { IconType } from 'react-icons/lib';
import {
  TbBed,
  TbBrandTelegram,
  TbBuildingCommunity,
  TbBus,
  TbCalendarMonth,
  TbCurrencyBitcoin,
  TbHammer,
  TbLanguage,
  TbMapRoute,
  TbMoodLookUp,
  TbNumber,
  TbRosetteDiscountCheck,
  TbSchool,
  TbSpeedboat,
  TbTag,
  TbToolsKitchen2,
  TbUsers,
  TbUsersGroup,
} from 'react-icons/tb';
import BookPixel from '#src/assets/icons/pixelated/book.svg?react';
import CalendarPixel from '#src/assets/icons/pixelated/calendar.svg?react';
import CheckPixel from '#src/assets/icons/pixelated/check.svg?react';
import HeartPixel from '#src/assets/icons/pixelated/heart_speaking.svg?react';
import SuccessParty from '#src/assets/icons/success_party.svg?react';
import { GeneralPaymentModal } from '#src/components/GeneralPaymentModal/payment-modal/general-payment-modal.tsx';
import { fixEmbedUrl } from '#src/components/Markdown/conference-markdown-body.tsx';
import { ReactPlayer } from '#src/components/react-player.tsx';
import { AppContext } from '#src/providers/context.tsx';
import { ConversionRateContext } from '#src/providers/conversionRateContext.tsx';
import { trpc } from '#src/utils/trpc.ts';
import { SummerSchoolWithdrawButton } from './summer-school-withdraw-button.tsx';

export const SummerSchool = ({
  courseId,
}: {
  courseId: string;
}) => {
  const { conversionRate } = useContext(ConversionRateContext);
  const { session } = useContext(AppContext);
  const isLoggedIn = !!session;

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [satsPrice, setSatsPrice] = useState<number>(0);
  const dollarPrice = 2500;

  const { data: payments, refetch: refetchPayment } = useQuery(
    trpc.user.getGeneralPaymentsProcedure.queryOptions(undefined, {
      enabled: isLoggedIn,
    }),
  );

  const withdrawMutation = useMutation(
    trpc.user.courses.withdrawUserFromCourseFinalLesson.mutationOptions({
      onSuccess: () => {
        location.reload();
      },
    }),
  );

  const isEventPaid = useMemo(
    () =>
      payments?.some(
        (payment) =>
          payment.paymentStatus === 'paid' &&
          payment.item === 'summer_school_2025',
      ),
    [courseId, payments],
  );

  useEffect(() => {
    let satsPrice = -1;
    if (conversionRate) {
      satsPrice = Math.round((dollarPrice * 100_000_000) / conversionRate);
      if (satsPrice > 10 && process.env.NODE_ENV === 'development') {
        satsPrice = 10;
      }
    }

    setSatsPrice(satsPrice);
  }, [dollarPrice]);

  return (
    <div className="flex flex-col gap-4 md:gap-8 w-full max-w-[1000px]">
      <section className="flex flex-col md:mt-8 w-full gap-4 md:gap-8">
        <div className="flex flex-col gap-5">
          <h2 className="mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle !font-bold">
            {t('dashboard.course.summerSchool')}
          </h2>
        </div>
        <div>
          {isEventPaid ? (
            <>
              <Banner
                variant="success"
                icon={<CheckPixel className="fill-brightGreen-6" />}
              >
                <BannerTitle>You've successfully enrolled!</BannerTitle>
              </Banner>
              <h2 className="mt-4 mb-2 mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle !font-bold">
                Next step
              </h2>
              <p>
                Join the Telegram group to connect with other students and get
                all the key Summer School updates.
              </p>
              <a
                href="https://t.me/+f8Zt5yQI3jc5ZTZk"
                target="_blank"
                rel="noreferrer"
              >
                <Button className="mx-auto my-4">
                  <TbBrandTelegram className="mr-2" />
                  Join Telegram Group
                </Button>
              </a>
            </>
          ) : (
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
          )}
        </div>
      </section>
      {isEventPaid ? (
        <CollapsibleDropdown
          title="Overview"
          className="border border-newGray-4"
          variant="dark"
          defaultOpen={false}
        >
          <SummerPresentation />
        </CollapsibleDropdown>
      ) : (
        <SummerPresentation />
      )}

      <WhatsIncluded satsPrice={satsPrice} />

      {!isEventPaid ? (
        <div className="flex flex-row justify-center gap-4">
          <SummerSchoolWithdrawButton
            onConfirm={() => {
              withdrawMutation.mutate({
                courseId: courseId,
              });
            }}
          />
          <Button
            onClick={() => {
              setIsPaymentModalOpen(true);
            }}
          >
            Yes, enroll and pay now
          </Button>
        </div>
      ) : null}

      <GeneralPaymentModal
        item={GeneralPaymentItem.SummerSchool2025}
        satsPrice={satsPrice}
        dollarPrice={dollarPrice}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          refetchPayment();
          setTimeout(() => {
            refetchPayment();
          }, 5000);
          setTimeout(() => {
            refetchPayment();
          }, 10000);
        }}
      />
    </div>
  );
};

function SummerPresentation() {
  const videoUrl = 'https://youtu.be/kaePVoEuP00';

  return (
    <section>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="mobile-h3 md:title-large-sb-24px  text-dashboardSectionTitle">
            What to expect
          </h2>
          <div className="flex flex-row gap-4 mt-4 text-center">
            <Card
              className="w-full border-0"
              withPadding={false}
              paddingClass="py-8 px-8"
            >
              <div className="flex flex-col gap-2 items-center">
                <CalendarPixel className="justify-self-center size-11" />
                <p className="text-xl font-medium">6 days all-inclusive</p>
                <div className="text-base flex flex-row gap-2 text-newGray-1 items-center">
                  <TbCalendarMonth />
                  July 20 - 26
                </div>
              </div>
            </Card>
            <Card
              className="w-full border-0"
              withPadding={false}
              paddingClass="py-8 px-8"
            >
              <div className="flex flex-col gap-2 items-center">
                <BookPixel className="justify-self-center size-11 fill-primary" />
                <p className="text-xl font-medium">5 full-day courses</p>
                <div className="text-base flex flex-row gap-2 text-newGray-1 items-center">
                  <TbCalendarMonth />
                  July 21 - 26
                </div>
              </div>
            </Card>
            <Card
              className="w-full border-0"
              withPadding={false}
              paddingClass="py-8 px-8"
            >
              <div className="flex flex-col gap-2 items-center">
                <HeartPixel className="justify-self-center size-11 fill-primary" />
                <p className="text-xl font-medium">
                  Top industry leaders insights & network
                </p>
              </div>
            </Card>
          </div>
        </div>

        <h2 className="mt-4 mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          As well as
        </h2>
        <div className="flex flex-col gap-3 ml-6">
          <ListElement icon={TbHammer}>
            <span className="font-semibold">Hands-on workshops</span>
            <span className=""> to apply what you learn</span>
          </ListElement>
          <ListElement icon={TbUsersGroup}>
            <span className="font-semibold">Collaborative group sessions</span>
            <span className="">to challenge ideas and exchange feedback</span>
          </ListElement>
          <ListElement icon={TbSchool}>
            <span className="font-semibold">Expert-led lectures</span>
            <span className=""> and real-world case studies</span>
          </ListElement>
          <ListElement icon={TbCurrencyBitcoin}>
            <span className="font-semibold">Top-tier guest speakers </span>
            <span className="">
              from the Bitcoin industry, every morning and afternoon
            </span>
          </ListElement>
          <ListElement icon={TbMapRoute}>
            <span className="font-semibold">Strategy deep dives </span>
            <span className="">
              into Bitcoin adoption and business use cases
            </span>
          </ListElement>
        </div>

        <h2 className="mt-4 mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
          Beyond the Classroom
        </h2>
        <div className="flex flex-col gap-3 ml-6">
          <ListElement icon={TbUsers}>
            <span className="">Build</span>
            <span className="font-semibold"> lifelong connections </span>
            <span className="">
              with peers and leaders in the Bitcoin space
            </span>
          </ListElement>
          <ListElement icon={TbMoodLookUp}>
            <span className="font-semibold">Get inspired </span>
            <span className="">
              , challenge your thinking, and have a ton of fun doing it
            </span>
          </ListElement>
          <ListElement icon={TbSpeedboat}>
            <span className="">Finish off with a</span>
            <span className="font-semibold"> boat trip </span>
            <span className="">on Lake Lugano (July 26)</span>
          </ListElement>
        </div>

        <h2 className="mt-4 mobile-h3 md:title-large-sb-24px text-dashboardSectionTitle">
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

function WhatsIncluded({ satsPrice }: { satsPrice: number }) {
  return (
    <section>
      <div className="flex flex-col gap-4 bg-newGray-6 py-4 rounded-xl">
        <h2 className="ml-4 mobile-h3 md:title-large-sb-24px  text-dashboardSectionTitle">
          What's included
        </h2>

        <DividerSimple mode={'light'} />

        <div className="px-4 flex flex-col gap-2">
          <p className="font-medium">Logistics</p>
          <div className="bg-white p-4 rounded-xl">
            <ListElement2 icon={TbBed} leftText="Accommodation">
              Hotel in Brusimpiano (July 20–26) and optional stay extension at a
              discounted rate
            </ListElement2>
            <ListElement2 icon={TbBus} leftText="Transport">
              Daily transport to and from Lugano
            </ListElement2>
            <ListElement2 icon={TbToolsKitchen2} leftText="Food">
              Breakfast, lunch & dinner included every day
            </ListElement2>
            <ListElement2 icon={TbSpeedboat} leftText="Experiences">
              Boat trip on Lake Lugano (July 26)
            </ListElement2>
            <ListElement2
              icon={TbRosetteDiscountCheck}
              leftText="Scholarships Availability"
            >
              Available, based on merit
            </ListElement2>
          </div>

          <p className="font-medium mt-4">Info</p>
          <div className="bg-white p-4 rounded-xl">
            <ListElement2 icon={TbBuildingCommunity} leftText="Location">
              Lugano, Switzerland
            </ListElement2>
            <ListElement2 icon={TbNumber} leftText="Number of spots available">
              21
            </ListElement2>
            <ListElement2 icon={TbLanguage} leftText="Language">
              English
            </ListElement2>
          </div>

          <p className="font-medium mt-4">Pricing</p>
          <div className="bg-white p-4 rounded-xl">
            <ListElement2 icon={TbTag} leftText="Total price">
              <div className="flex flex-col">
                <span>$2,500</span>
                <span className="text-darkOrange-4">{satsPrice} sats</span>
              </div>
            </ListElement2>
          </div>
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

function ListElement2({
  icon,
  leftText,
  children,
}: { icon: IconType; leftText: string; children: React.ReactNode }) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between gap-4 my-2">
      <div className="flex flex-row gap-2 items-center text-newGray-1">
        <Icon className="size-6" />
        <span className="text-sm md:text-base">{leftText}</span>
      </div>
      <p className="text-sm md:text-lg text-newBlack-3 text-right">
        {children}
      </p>
    </div>
  );
}
