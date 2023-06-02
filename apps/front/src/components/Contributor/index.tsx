import grayHeart from '../../assets/icons/gray_heart.svg';
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
        <div className="mb-1 text-sm font-thin text-gray-500 italic flex">
          {prefix}
          <img className="ml-1" src={grayHeart} />
        </div>
      )}
      <div className="flex flex-row float-right bg-white border-2 rounded-l-3xl rounded-r-lg">
        {contributor?.image && (
          <Avatar
            rounded
            size="xs"
            alt="contributor profile pic"
            image={contributor.image}
          />
        )}
        <div className="flex flex-col justify-center ml-2">
          <span className="text-sm leading-tight mr-2">
            {contributor.username}
          </span>
        </div>
      </div>
    </div>
  );
};
