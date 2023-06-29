import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type ResourceType = 'tutoriel' | 'course' | 'interview' | 'audioBook';

export const RelatedResources = (
  resources: Partial<Record<ResourceType, { label: string; path?: string }[]>>
) => {
  const { t } = useTranslation();

  const resourcesTypeLabelByKey: Record<ResourceType, string> = {
    tutoriel: t('words.tutorial'),
    course: t('words.course'),
    interview: t('words.interview'),
    audioBook: t('words.audioBook'),
  };

  const resourceTypes = useMemo(
    () => Object.keys(resources) as ResourceType[],
    [resources]
  );

  return (
    <div className="bg-secondary-400 text-primary-800 my-2 flex w-full flex-col rounded-xl px-6 pb-6 pt-3">
      <h5 className="mb-2 text-base font-semibold">
        {t('words.relatedResources')}
      </h5>
      <div className="flex w-full flex-row justify-between text-sm">
        {resourceTypes.map((key) => (
          <div key={key}>
            <h6>{resourcesTypeLabelByKey[key]}: </h6>
            <ul className="list-disc pl-4 text-xs">
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
