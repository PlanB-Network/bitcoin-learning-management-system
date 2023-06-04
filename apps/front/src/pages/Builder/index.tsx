import { BsGithub, BsLink, BsTwitter } from 'react-icons/bs';
import { GiBirdMask } from 'react-icons/gi';
import { Link, useParams } from 'react-router-dom';

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
    <ResourceLayout
      title="The Builders' Portal"
      tagLine="This portal is open-source & open to contribution. Thanks for
      grading and sharing!"
      style="flex content-center items-stretch flex-wrap flex-col space-around justify-start"
    >
      <Card className="mx-auto max-w-[90vw] sm:max-w-6xl">
        <div className="my-4 grid w-full grid-cols-1 grid-rows-6 px-4 sm:grid-cols-3 sm:px-8">
          <h3 className="text-primary-900 col-span-1 row-span-1 mb-8 text-3xl font-semibold uppercase sm:text-4xl">
            {builder?.name}
          </h3>
          <div className="col-span-2 row-span-1 sm:ml-12">
            {builder?.tags.map((tag) => (
              <Link to={`/builders?tag=${tag}`} key={tag}>
                <Tag className="ml-1">{tag}</Tag>
              </Link>
            ))}
          </div>
          <div className="border-primary-900 row-span-5 mb-4 flex flex-row flex-wrap items-center border-b-4 border-solid pb-10 sm:mb-0 sm:flex-col sm:border-b-0 sm:border-r-4 sm:pb-0 sm:pr-16">
            <img
              src={builder?.logo || builderImage}
              className="w-full"
              alt="something representing the company"
            />
            <div className="mx-2 my-6 flex justify-around w-full">
              <a
                href={builder?.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsGithub size={24} />
              </a>
              <a
                href={builder?.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsTwitter size={24} />
              </a>
              <a
                href={builder?.nostr}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GiBirdMask size={24} />
              </a>
              <a
                href={builder?.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BsLink size={24} />
              </a>
            </div>
          </div>

          <div className="col-span-2 row-span-5 ml-0 flex flex-col space-y-4 text-sm sm:ml-12">
            <p className="text-justify" style={{ whiteSpace: 'pre-line' }}>
              {builder?.description}
            </p>

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
