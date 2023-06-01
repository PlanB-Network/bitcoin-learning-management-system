import { useParams } from 'react-router-dom';

import { trpc } from '@sovereign-academy/api-client';

import builderImage from '../../assets/placeholder-assets/seedsigner.jpg';
import { Card } from '../../atoms/Card';
import { Tag } from '../../atoms/Tag';
import { ResourceLayout } from '../../components';

export const Builder = () => {
  const { builderId } = useParams();
  const { data: builder } = trpc.content.getBuilder.useQuery({
    id: Number(builderId),
    language: 'en',
  });

  return (
    <ResourceLayout title={builder?.name ?? ''}>
      <Card className="max-w-[90vw] sm:max-w-6xl mx-auto">
        <div className="grid grid-cols-1 grid-rows-6 px-4 my-4 w-full sm:grid-cols-3 sm:px-8">
          <h3 className="col-span-1 row-span-1 mb-8 text-3xl font-semibold uppercase sm:text-4xl text-primary-900">
            {builder?.name}
          </h3>
          <div className="col-span-2 row-span-1">
            <Tag>OpenSource</Tag>
            <Tag>BTC Only</Tag>
          </div>

          <div className="flex flex-row row-span-5 pb-10 mb-4 border-b-4 border-solid sm:mb-0 sm:border-b-0 sm:border-r-4 sm:pb-0 sm:pr-16 border-primary-900 sm:flex-col">
            <img
              src={builder?.logo || builderImage}
              className="w-full"
              alt="something representing the company"
            />

            <div className="mx-2 my-6">Social medias</div>
          </div>

          <div className="flex flex-col col-span-2 row-span-5 ml-0 space-y-4 text-sm sm:ml-12">
            <p className="text-justify">{builder?.description}</p>

            {/* <RelatedResources
            tutoriel={[{ label: 'Seed signer Device' }]}
            interview={[
              {
                label: 'CEO Interview',
                path: replaceDynamicParam(Routes.Interview, {
                  interviewId: 'ja78172',
                }),
              },
            ]}
            course={[
              {
                label: 'BTC 204',
                path: replaceDynamicParam(Routes.Course, {
                  courseId: 'btc-204',
                }),
              },
            ]}
          /> */}
          </div>
        </div>
      </Card>
    </ResourceLayout>
  );
};
