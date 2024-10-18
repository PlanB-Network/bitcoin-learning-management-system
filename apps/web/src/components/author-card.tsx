import type { FormattedProfessor } from '@blms/types';
import { TextTag } from '@blms/ui';

import { ProfessorCardReduced, SocialLinks } from './professor-card.tsx';

interface AuthorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: FormattedProfessor;
  hasDonateButton?: boolean;
}
{
  /* eslint-disable tailwindcss/no-contradicting-classname */
}

export const AuthorCard = ({
  professor,
  hasDonateButton,
  ...props
}: AuthorCardProps) => {
  return (
    <article {...props} className="flex flex-col w-full">
      <div className="mt-5 md:mt-6 flex max-md:flex-col gap-5 md:gap-7 md:py-5">
        <ProfessorCardReduced
          professor={professor}
          hasDonateButton={hasDonateButton}
        />

        <div className="flex flex-col items-center md:items-start">
          <div className="md:mt-4 flex flex-wrap gap-2.5 items-center md:order-2">
            {professor.tags?.map((tag) => <TextTag key={tag}>{tag}</TextTag>)}
          </div>

          <div className="max-md:mt-1 md:order-3">
            <SocialLinks professor={professor} />
          </div>
          <p className="max-md:mt-5 body-16px text-newBlack-1 md:max-w-[596px] md:order-1 w-full">
            {professor.bio}
          </p>
        </div>
      </div>
    </article>
  );
};
