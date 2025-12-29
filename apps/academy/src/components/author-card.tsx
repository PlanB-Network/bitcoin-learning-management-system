import type { FormattedProfessor } from '@blms/types';
import { cn, TextTag } from '@blms/ui';

import { ProfessorCardReduced, SocialLinks } from './professor-card.tsx';

interface AuthorCardProps extends React.HTMLProps<HTMLDivElement> {
  professor: FormattedProfessor;
  centeredContent?: boolean;
  hasDonateButton?: boolean;
  mobileSize?: 'small' | 'medium';
  mode?: 'dark';
}

export const AuthorCard = ({
  professor,
  hasDonateButton,
  centeredContent = true,
  mobileSize = 'small',
  mode,
  ...props
}: AuthorCardProps) => {
  return (
    <article {...props} className="flex flex-col w-full">
      <div
        className={cn(
          'flex max-md:flex-col gap-5 md:gap-7 md:items-start',
          centeredContent && 'items-center md:py-5',
        )}
      >
        <ProfessorCardReduced
          professor={professor}
          hasDonateButton={hasDonateButton}
          mobileSize={mobileSize}
        />

        <div
          className={cn(
            'flex flex-col md:items-start',
            centeredContent && 'items-center',
          )}
        >
          <p className="body-base md:max-w-[596px] w-full">{professor.bio}</p>
          <div className="mt-4 md:mt-4 flex flex-wrap gap-2.5 items-center">
            {professor.tags?.map((tag) => (
              <TextTag
                key={tag}
                mode={mode ? mode : undefined}
                className="capitalize"
              >
                {tag}
              </TextTag>
            ))}
          </div>
          <div className="md:mt-1 w-fit">
            <SocialLinks professor={professor} />
          </div>
        </div>
      </div>
    </article>
  );
};
