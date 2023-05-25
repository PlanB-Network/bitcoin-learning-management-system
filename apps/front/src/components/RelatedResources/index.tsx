import { useMemo } from 'react';
import { Link } from 'react-router-dom';

type ResourceType = 'tutoriel' | 'course' | 'interview' | 'audioBook';

const resourcesTypeLabelByKey: Record<ResourceType, string> = {
  tutoriel: 'Tutoriel',
  course: 'Course',
  interview: 'Interview',
  audioBook: 'AudioBook',
};

export const RelatedResources = (
  resources: Partial<Record<ResourceType, { label: string; path?: string }[]>>
) => {
  const resourceTypes = useMemo(
    () => Object.keys(resources) as ResourceType[],
    [resources]
  );

  return (
    <div className="flex flex-col px-6 pt-3 pb-6 my-2 w-full rounded-xl bg-secondary-400 text-primary-800">
      <h5 className="mb-2 text-base font-semibold">Related resources</h5>
      <div className="flex flex-row justify-between w-full text-sm">
        {resourceTypes.map((key) => (
          <div key={key}>
            <h6>{resourcesTypeLabelByKey[key]}: </h6>
            <ul className="pl-4 text-xs list-disc">
              {resources[key]?.map((resource, index) =>
                resource.path ? (
                  <Link
                    className="hover:underline"
                    key={resource.path}
                    to={resource.path}
                  >
                    <li>{resource.label}</li>
                  </Link>
                ) : (
                  <li key={`resource-${key}-${index}`}>{resource.label}</li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
