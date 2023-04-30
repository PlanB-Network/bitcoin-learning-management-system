import { BsArrowRight } from 'react-icons/bs';

import { Avatar } from '../../../atoms/Avatar';
import { Button } from '../../../atoms/Button';
import { Card } from '../../../atoms/Card';
import { Tag } from '../../../atoms/Tag';

interface CoursePreviewProps {
  author: {
    name: string;
    img: string;
  };
  title: string;
  subTitle: string;
  tags: string[];
  preview: {
    text: string;
    img: string;
  };
}

export const CoursePreview = ({
  title,
  subTitle,
  tags,
  preview,
  author,
}: CoursePreviewProps) => {
  return (
    <Card image={preview.img}>
      <h5 className="mb-4 text-2xl font-bold tracking-tight text-primary-900">
        {title}
      </h5>
      <div className="mb-2">
        {tags.map((tag) => (
          <Tag className="ml-1" key={tag}>
            {tag}
          </Tag>
        ))}
      </div>
      <div className="overflow-hidden mb-3 text-sm text-gray-600 text-ellipsis line-clamp-3">
        {preview.text}
      </div>
      <div className="flex flex-row justify-between items-center mt-8 w-full">
        <Avatar
          rounded
          image={author.img}
          alt="Rogzy presenting a course in El Salavor"
          size="m"
        />
        <Button size="m" iconRight={<BsArrowRight />}>
          Je me lance!
        </Button>
      </div>
    </Card>
  );
};
