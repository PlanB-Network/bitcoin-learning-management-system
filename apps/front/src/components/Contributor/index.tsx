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
        <div className="mb-1 flex text-sm font-thin italic text-gray-500">
          {prefix}
          <img
            className="ml-1"
            src={grayHeart}
            alt="a heart for nice contributor"
          />
        </div>
      )}
      <div className="float-right flex flex-row rounded-l-3xl rounded-r-lg border-2 bg-white">
        {contributor?.image && (
          <Avatar
            rounded
            size="xs"
            alt="contributor profile pic"
            image={contributor.image}
          />
        )}
        <div className="ml-2 flex flex-col justify-center">
          <span className="mr-2 text-sm leading-tight">
            {contributor.username}
          </span>
        </div>
      </div>
    </div>
  );
};
