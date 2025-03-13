import type { JoinedCourse } from '@blms/types';

import { DividerSimple, TextTag } from '@blms/ui';
import { Link } from '@tanstack/react-router';
import { t } from 'i18next';
import Business from '#src/assets/courses/business.svg?react';
import PlanbSchoolLogo from '#src/assets/courses/planb_school_logo_white.svg';
import { ListItem } from '#src/components/ListItem/list-item.tsx';
import { ButtonWithArrow } from '#src/molecules/button-arrow.tsx';
import { getTimeStringWithOnlyMonths } from '#src/utils/date.ts';
import { assetUrl } from '#src/utils/index.ts';
import { formatNameForURL } from '#src/utils/string.ts';
import { Image } from '#src/components/image.tsx';

export const FeaturedSchool = ({ course }: { course: JoinedCourse }) => {
  return (
    <section className="flex flex-col gap-4 md:gap-[30px] mx-auto max-w-[1126px] w-full">
      <div className="flex max-md:flex-col gap-2 md:gap-10 px-1">
        <img
          className="w-[116px] md:w-[215px] shrink-0"
          src={PlanbSchoolLogo}
          alt="Plan ₿ School Logo"
        />
        <div className="flex items-center gap-5">
          <div className="max-md:hidden w-0.5 h-11 bg-newGray-1" />
          <div className="flex gap-3 md:gap-4">
            <div className="flex items-center gap-2 text-darkOrange-5">
              <Business className="size-4 md:size-5 fill-darkOrange-5 shrink-0" />
              <span className="subtitle-medium-caps-18px md:subtitle-large-caps-22px">
                {course.name}
              </span>
            </div>
            <span className="text-newGray-5 leading-[160%] italic text-xs md:text-lg tracking-015px max-md:self-end shrink-0">
              {t('courses.explorer.comingSoon')}
            </span>
          </div>
        </div>
      </div>
      <p className="label-medium-16px md:subtitle-large-18px text-newGray-4 whitespace-pre-line px-1">
        {t('courses.explorer.planbSchoolHeadline')}
      </p>
      <SchoolCard course={course} />
      <DividerSimple
        mode="dark"
        className="max-w-[775px] mx-auto max-md:mt-5"
      />
    </section>
  );
};

const SchoolCard = ({ course }: { course: JoinedCourse }) => {
  return (
    <article className="relative max-md:max-w-[500px] w-full flex flex-col md:flex-row gap-2.5 md:gap-5 bg-darkOrange-9 border border-darkOrange-5 shadow-sm-section p-2.5 rounded-[10px] md:rounded-[20px] overflow-hidden max-md:mx-auto">
      <span className="absolute uppercase -top-px -left-px bg-white border border-white text-black body-semibold-12px md:title-medium-sb-18px rounded-br-[10px] py-[5px] px-2.5 md:py-2.5 md:px-[15px] md:rounded-br-[20px] z-10">
        {t('courses.explorer.planbSchool')}
      </span>

      <Image
        availableSizes={[512]}
        src={assetUrl(
          `courses/${course.index}`,
          'thumbnail.webp',
          course.lastCommit,
        )}
        alt={course.name}
        className="rounded-lg object-cover object-center [overflow-clip-margin:_unset] md:max-w-[490px] md:max-h-[288px] w-full mx-auto max-md:aspect-[270/203]"
      />


      <section className="flex flex-col gap-2.5 w-full shrink">
        <span className="text-white truncate subtitle-large-med-20px md:title-large-sb-24px">
          {course.name}
        </span>
        <div className="flex items-center gap-2 md:gap-2.5 flex-wrap">
          <TextTag
            size="verySmall"
            variant="lightMaroon"
            mode="dark"
            className="uppercase"
          >
            {t(`words.level.${course.level}`)}
          </TextTag>
          <TextTag
            size="verySmall"
            variant="lightMaroon"
            mode="dark"
            className="uppercase"
          >
            {t('courses.details.teacherLed')}
          </TextTag>
        </div>
        <p className="max-w-full text-tertiary-1 line-clamp-3 text-sm leading-snug tracking-015px md:text-base md:leading-relaxed md:tracking-[0.08px]">
          {course.goal}
        </p>
        <div className="flex flex-col mt-auto">
          <ListItem
            leftText={t('dashboard.calendar.calendar')}
            rightText={getTimeStringWithOnlyMonths(
              course.startDate,
              course.endDate,
            )}
          />
          <ListItem
            leftText={t('words.price')}
            rightText={`${course.inpersonPriceDollars}$`}
            className="border-y"
          />
        </div>
        <Link
          to={`/courses/${formatNameForURL(course.name)}-${course.id}`}
          className="w-full"
        >
          <ButtonWithArrow
            mode="dark"
            variant="primary"
            size="m"
            className="w-full mt-[5px]"
          >
            {t('courses.explorer.seeCourse')}
          </ButtonWithArrow>
        </Link>
      </section>
    </article>
  );
};
