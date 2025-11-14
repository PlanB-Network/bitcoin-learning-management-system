import {
  Button,
  ButtonWithArrow,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  Image,
} from '@blms/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TbChevronDown } from 'react-icons/tb';
import avatarImage from '#src/assets/programs/avatar.png';
import diplomaImage from '#src/assets/programs/diploma.png';
import levelIcon from '#src/assets/programs/icon-level.png';
import luggageIcon from '#src/assets/programs/icon-luggage.svg';
import textbookIcon from '#src/assets/programs/icon-textbook.png';
import toolsIcon from '#src/assets/programs/icon-tools.png';
import presentationImage from '#src/assets/programs/presentation.webp';
import trackImage from '#src/assets/programs/track.png';
import trackTriangleImage from '#src/assets/programs/track-triangle.png';
import track1Image from '#src/assets/programs/track1.webp';
import track2Image from '#src/assets/programs/track2.webp';
import track3Image from '#src/assets/programs/track3.webp';
import track4Image from '#src/assets/programs/track4.webp';
import videoScreenshotImage from '#src/assets/programs/video-screenshot.png';
import { PageLayout } from '#src/components/page-layout.tsx';
import { CourseCardBig } from '#src/patterns/course-card-big.tsx';
import { AppContext } from '#src/providers/context.tsx';

export const Route = createFileRoute('/$lang/_content/programs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  return (
    <PageLayout
      title="Plan ₿ Program"
      layoutSize="wide"
      backLink={{
        href: '/live-classes',
        text: t('navbar.liveClassesTitle'),
      }}
    >
      <ProgramPresentation />
      <TracksAndCalendar />
      <ChooseYourTrack />
      <EarnDiploma />
      <HearStudents />
      <Feedbacks />
      <FAQ />
    </PageLayout>
  );
}

function ProgramPresentation() {
  return (
    <div>
      <p className="-mt-2 md:-mt-5 label-label max-md:text-lg md:title-medium text-neutral-500">
        Transition your career into the Bitcoin industry
      </p>
      <div className="flex flex-col md:flex-row gap-8 md:gap-2 mt-6">
        <div className="flex flex-col md:w-3/5 justify-evenly max-md:gap-6">
          <ProgramElement
            title="Designed for professionals and career shifters"
            description="Get ready to take the next step in their professional path towards Bitcoin"
            icon={luggageIcon}
          />
          <ProgramElement
            title="Focused on real-world practice & networking"
            description="Learn from industry experts and build connections that last a lifetime"
            icon={toolsIcon}
          />
          <ProgramElement
            title="Two specialized tracks: Business & Developer"
            description="Choose the path that best fits your background and goals"
            icon={textbookIcon}
          />
          <ProgramElement
            title="A competitive program rewarding the best students"
            description="Get the best grades to have the opportunity to join the Lugano Summer School"
            icon={levelIcon}
          />
        </div>
        <img className="md:w-2/5 object-cover" src={presentationImage} alt="" />
      </div>
      <div className="flex flex-row gap-1 w-full mt-9">
        <Link
          to="/courses/plan-developer-program-0be6cfae-9d32-11f0-9601-0f79f5ccc576"
          className="w-full"
        >
          <ButtonWithArrow variant={'newTertiary'} className="w-full">
            Developer Program
          </ButtonWithArrow>
        </Link>
        <Link
          to="/courses/plan-business-program-a54c48c0-9b90-11f0-bee7-dbbaea825cda"
          className="w-full"
        >
          <ButtonWithArrow variant={'newTertiary'} className="w-full">
            Business Program
          </ButtonWithArrow>
        </Link>
      </div>
    </div>
  );
}

function ProgramElement({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex flex-row gap-3 items-center">
      <div className="flex items-center justify-center bg-orange-50 rounded-full p-4">
        <Image
          className="size-8"
          src={icon}
          alt=""
          breakpoints={{ default: 100 }}
        />
      </div>
      <div>
        <p className="title-base text-orange-500">{title}</p>
        <p className="body-base">{description}</p>
      </div>
    </div>
  );
}

function TracksAndCalendar() {
  return (
    <div>
      <SectionTitle title="Tracks and calendar" />
      <p>
        The Plan ₿ Program, developed by Giacomo Zucco, is a five-month program
        that
        <span className="font-medium">
          {' '}
          combines theory, real-case practice and networking{' '}
        </span>
        opportunities. Choose your specialized track.
      </p>

      <div className="flex flex-row gap-2 mt-10">
        <img src={trackImage} alt="" className="max-xl:hidden w-[200px]" />
        <div className="flex flex-col gap-5 w-auto">
          <CalendarElement
            title="Foundations"
            subtitle="Start learning the right way"
            date="February"
            location1="Lugano, Switzerland"
            location2="Online"
            contentText="The program starts with lectures led by Giacomo Zucco. Thanks to his characteristic style, you will develop in one month a deep understanding of Bitcoin relevancy and implications."
            imageUrl={track1Image}
          />
          <CalendarElement
            title="Masterclasses"
            subtitle="Learn from leading experts"
            date="March"
            location1="Various locations"
            location2="Online"
            contentText="The Plan ₿ Program brings together a distinguished group of professors and industry leaders — each an expert in their field. Through live, expert-led sessions, you’ll gain direct access to some of the most influential minds shaping the Bitcoin ecosystem."
            imageUrl={track2Image}
          />
          <CalendarElement
            title="Project Assignments"
            subtitle="Work with the best Bitcoin companies"
            date="April - May"
            location1="Online"
            contentText="The best 100 students of each track will be able to choose an assignment associated with either a Bitcoin company or open-source project. This is your chance to be mentored directly by a professional. Assignments are individual work."
            imageUrl={track3Image}
          />
          <CalendarElement
            title="Summer School"
            subtitle="Build lifelong connections"
            date="June"
            location1="Lugano, Switzerland"
            contentText="The 21 best-ranked students of each track will be selected to join the Lugano Summer School. This 2-week intensive bootcamp blends expert-led workshops, and practical applications of Bitcoin businesses. Beyond the classroom, it's a career-defining experience, a chance to connect directly with industry leaders, showcase your skills, and open doors to future opportunities."
            imageUrl={track4Image}
          />
        </div>
      </div>
      <Button className="justify-self-center mt-6 w-2/5">Enroll now</Button>
    </div>
  );
}

function CalendarElement({
  title,
  subtitle,
  date,
  location1,
  location2,
  contentText,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  date: string;
  location1: string;
  location2?: string;
  contentText: string;
  imageUrl: string;
}) {
  return (
    <div className="flex flex-row">
      <img
        src={trackTriangleImage}
        alt=""
        className="h-fit self-center -mr-1 max-xl:hidden"
      />

      <div className="w-auto bg-orange-50 rounded-xl px-2 pt-3">
        <div className="flex flex-row justify-between pb-3">
          <div className="flex flex-col text-orange-500">
            <p className="title-medium">{title}</p>
            <p className="label">{subtitle}</p>
          </div>
          <div className="flex flex-col body-base text-neutral-500 items-end">
            <p>{date}</p>
            <div>
              {location2 ? (
                <span className="border-r border-orange-100 pr-2">
                  {location2}
                </span>
              ) : null}
              <span className="pl-2">{location1}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col xl:flex-row bg-white mb-2 p-3 rounded-xl">
          <p className="text-orange-800 text-sm">{contentText}</p>
          <img className="object-cover rounded-xl" src={imageUrl} alt="" />
        </div>
      </div>
    </div>
  );
}

function ChooseYourTrack() {
  const { courses } = useContext(AppContext);

  const planbCourses = !courses
    ? []
    : courses.filter(
        (course) =>
          course.isArchived === false &&
          course.isPlanbSchool === true &&
          (course.endDate ? course.endDate.getTime() > Date.now() : true),
      );

  return (
    <div>
      <SectionTitle title="Choose your track and enroll" />

      <div className="flex flex-wrap gap-4 lg:gap-8 mt-2 lg:mt-4 px-2 lg:px-6 pb-2 lg:pb-6">
        {planbCourses.map((course) => (
          <div key={course.id} className="w-full">
            <CourseCardBig course={course} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EarnDiploma() {
  return (
    <div>
      <div className="flex flex-row">
        <div className="flex flex-col gap-4">
          <SectionTitle title="Earn a Bitcoin Diploma trusted by top Bitcoin companies" />
          <p>
            The top-performing students selected for the Summer School in Lugano
            earn an official, physical Plan ₿ Diploma, a distinction that
            recognizes not only their academic excellence but also their proven,
            hands-on performance throughout the program. This diploma is a
            trusted signal of practical skills, professional discipline, and
            real-world contribution to Bitcoin projects.
          </p>
          <p>
            From last year's cohort of 21 graduates, more than 13 have already
            been hired by leading Bitcoin companies — turning this achievement
            into their first major step into the industry.
          </p>
        </div>
        <img className="w-1/2 h-fit self-center" src={diplomaImage} alt="" />
      </div>
    </div>
  );
}

function HearStudents() {
  return (
    <div>
      <SectionTitle title="Hear from students who became teachers: Mari and Birk's stories" />
      <Link
        to="https://x.com/planb_network/status/1947706959790018860?s=20"
        target="_blank"
        rel="noreferrer"
      >
        <img className="mt-4" src={videoScreenshotImage} alt="" />
      </Link>
    </div>
  );
}

function Feedbacks() {
  const commentClassName = 'label bg-brown-50 rounded-4xl px-6 py-4';

  return (
    <div>
      <div className="flex flex-col gap-6">
        <SectionTitle title="What students think about the program" />
        <p className={cn(commentClassName, 'w-[640px] self-end')}>
          “This experience has been{' '}
          <span className="font-medium">truly transformative</span>. I pushed
          myself in ways I hadn't before — building a real-world proposal,
          collaborating with mentors, and challenging my thinking. I'm grateful
          for the knowledge, community, and support. Excited for what comes
          next! :D”
        </p>
        <FeedbackUser
          className="self-end"
          name="Cristian Antonio Garcia"
          imageUrl={avatarImage}
        />
        <p className={cn(commentClassName, 'w-[640px] self-start')}>
          “Plan ₿ Biz School 2025 has been{' '}
          <span className="font-medium">a mind blowing experience</span>,
          learned a lot. The speakers have been{' '}
          <span className="font-medium">
            World Class experts in their fields
          </span>
          , and the international diversity was so great.”
        </p>
        <FeedbackUser
          className="self-start"
          name="Luis Escobar"
          imageUrl={avatarImage}
        />
        <p className={cn(commentClassName, 'w-[640px] self-end')}>
          “<span className="font-medium">A top-level course</span>, enriched by
          outstanding guest lectures: having the chance to interact directly
          with some of the{' '}
          <span className="font-medium">
            most influential and skilled professionals
          </span>{' '}
          in the field was a{' '}
          <span className="font-medium">truly invaluable</span> experience.
          Although most students attended the course online, for those ,like
          myself ,who had the privilege of participating in person, the
          experience was even more meaningful.”
        </p>
        <FeedbackUser
          className="self-end"
          name="Beatrice Sofia Fiori"
          imageUrl={avatarImage}
        />
        <p className={cn(commentClassName, 'w-[640px] self-start')}>
          “I just completed Plan ₿ Biz School 2025 and it was truly excellent.
          The course content is well-structured, practical, and taught by true
          industry leaders. Whether you're new to Bitcoin or already in the
          space, this course offers valuable, real-world insights. Highly
          recommended.”
        </p>
        <FeedbackUser
          className="self-start"
          name="Jose Saenz"
          imageUrl={avatarImage}
        />
        <p className={cn(commentClassName, 'w-[640px] self-end')}>
          Thanks for{' '}
          <span className="font-medium">
            excellent teachers and content provided
          </span>
          . I would highly recommend this program to anyone else on their
          Bitcoin journey in the future.
        </p>
        <FeedbackUser
          className="self-end"
          name="ticoo"
          imageUrl={avatarImage}
        />
      </div>
      <Button className="justify-self-center mt-6 w-2/5">Enroll now</Button>
    </div>
  );
}

function FeedbackUser({
  className,
  name,
  imageUrl,
}: {
  className?: string;
  name: string;
  imageUrl: string;
}) {
  return (
    <div className={cn(className, 'flex flex-row gap-3')}>
      <img src={imageUrl} alt="" />
      <p className="title-small">{name}</p>
    </div>
  );
}

function FAQ() {
  return (
    <div>
      <SectionTitle title="Frequently Asked Questions" />

      <div className="mt-6">
        <FAQQuestion
          question="Should I be based in Lugano to enroll?"
          answer="No, you don't have to be based in Lugano. Although you will get the full experience by staying in Lugano to attend most of the lectures in-person, both programs have been fully designed to be followed from anywhere in the world. All lectures are broadcast, and you will have access to them via the Plan B Academy."
        />
        <FAQQuestion
          question="How much does it cost?"
          answer="Early-bird registrations submitted before December 31st, 2025, will benefit from a reduced rate of $450. From December to March, the registration fee will increase to $900. The participation at the Summer School requires an additional fee of $3,500 to cover the tuition and accommodation expenses."
        />
        <FAQQuestion
          question="Can I have access to lectures that I cannot attend?"
          answer="Yes, you will have access to all lecture recordings. You may miss the interaction and the possibility to ask your questions directly to the lecturer, but all the knowledge will still be accessible to you. These recordings are even accessible after the end of the program if you want to re-watch lectures in the future."
        />
        <FAQQuestion
          question="Can I do both Business and Developer programs?"
          answer="Yes, you can, but it will be on you to adjust the potential schedule conflicts that may arise. If selected for the assignment phase, you will also be assigned 2 assignments at the same time. Doing this is not recommended for the faint of heart."
        />
        <FAQQuestion
          question="How do selections through different phases work?"
          answer="During the first two phases (lectures and masterclasses), you will have four multiple-choice question exams to evaluate your understanding and knowledge. These exams will be based on the live sessions. Then, if you are selected for the assignment phase, you will be graded based on your assignment output. During each selection, your rank is defined based on the weighted average of your grades. The weight for each exam will be announced during the program."
        />
        <FAQQuestion
          question="Do you provide any financial or logistical support for the Summer School?"
          answer="If you are selected for the Lugano Summer School, we will provide support based on your situation, notably for visa registration and trip planning. Some scholarships will be offered to the top-ranked candidates of the final selection."
        />
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="title-large mt-9">{title}</h2>;
}

function FAQQuestion({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="group title-small font-medium text-brown-800 text-left pl-6 py-3 bg-brown-50 border border-brown-100 rounded-sm w-full mb-1">
        <div className="flex flex-row items-center justify-between">
          {question}
          <TbChevronDown
            size={24}
            className="text-brown-400 mr-6 group-data-[state=open]:rotate-0 group-data-[state=closed]:-rotate-180 shrink-0 transition-transform ease-in-out"
          />
        </div>
        <CollapsibleContent className="mt-6 body-base">
          {answer}
        </CollapsibleContent>
      </CollapsibleTrigger>
    </Collapsible>
  );
}
