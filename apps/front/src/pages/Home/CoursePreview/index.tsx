import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

import { startButton } from '../index.css';

import {
  coursePreviewCard,
  coursePreviewFooter,
  coursePreviewImg,
  coursePreviewTag,
} from './index.css';

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
  const header = (
    <img className={coursePreviewImg} alt="Card" src={preview.img} />
  );

  const footer = (
    <div className={coursePreviewFooter}>
      <Avatar image={author.img} size="xlarge" shape="circle" />
      <Button label="Je me lance!" className={startButton} />
    </div>
  );

  return (
    <Card
      title={title}
      subTitle={subTitle}
      footer={footer}
      header={header}
      className={coursePreviewCard}
    >
      <div>
        {tags.map((tag) => (
          <Tag className={coursePreviewTag} key={tag } value={tag} />
        ))}
      </div>

      <p className="m-0">{preview.text}</p>
    </Card>
  );
};
