import { Avatar } from '../../atoms/Avatar';

interface ContributorProps {
  prefix?: string;
  contributor: {
    image?: string;
    username: string;
    title?: string;
  };
}

export const Contributor = ({ prefix, contributor }: ContributorProps) => {
  return (
    <div>
      {prefix && (
        <div className="mb-1 text-sm font-thin text-primary-900">{prefix}</div>
      )}
      <div className="flex flex-row float-right">
        {contributor?.image && (
          <Avatar
            rounded
            size="s"
            alt="contributor profile pic"
            image={contributor.image}
          />
        )}
        <div className="flex flex-col justify-center ml-2">
          <span className="text-lg leading-tight">{contributor.username}</span>
          {contributor?.title && (
            <span className="text-xs italic font-thin text-gray-400">
              {contributor.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
