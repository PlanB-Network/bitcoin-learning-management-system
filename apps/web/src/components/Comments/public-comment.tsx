import SignInIconLight from '#src/assets/icons/profile_log_in_light.svg';

interface PublicCommentProps {
  author: string;
  date: string;
  avatar?: string;
  comment: string;
}

export const PublicComment = ({
  author,
  date,
  avatar,
  comment,
}: PublicCommentProps) => {
  return (
    <article className="bg-newGray-6 rounded-lg border border-newGray-5 h-[171px] p-2.5 w-full min-[600px]:max-w-[270px] md:max-w-[322px] flex flex-col gap-1">
      <header className="w-full flex gap-6 items-center shrink-0">
        <img
          className="size-[45px] rounded-full shrink-0"
          src={avatar ? `/api/file/${avatar}` : SignInIconLight}
          alt={`${author}`}
        />
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <h2 className="text-darkOrange-5 title-medium-sb-18px truncate">
            {author}
          </h2>
          <time className="text-newBlack-5 label-medium-16px truncate">
            {new Date(date).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </header>
      <p className="size-full overflow-y-scroll scrollbar-light px-4 py-1.5 bg-commentTextBackground border border-gray-500/10 rounded-md text-newBlack-3 text-sm leading-[120%]">
        {comment}
      </p>
    </article>
  );
};
