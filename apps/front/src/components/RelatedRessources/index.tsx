import { useMemo } from 'react';
import { Link } from 'react-router-dom';

type RessourceType = 'tutoriel' | 'course' | 'interview' | 'audioBook';

const ressourcesTypeLabelByKey: Record<RessourceType, string> = {
  tutoriel: 'Tutoriel',
  course: 'Course',
  interview: 'Interview',
  audioBook: 'AudioBook',
};

export const RelatedRessources = (
  ressources: Partial<Record<RessourceType, { label: string; path?: string }[]>>
) => {
  const ressourceTypes = useMemo(
    () => Object.keys(ressources) as RessourceType[],
    [ressources]
  );

  return (
    <div className="flex flex-col px-6 pt-3 pb-6 my-2 w-full rounded-xl bg-secondary-400 text-primary-800">
      <h5 className="mb-2 text-base font-semibold">Related ressources</h5>
      <div className="flex flex-row justify-between w-full text-sm">
        {ressourceTypes.map((key) => (
          <div key={key}>
            <h6>{ressourcesTypeLabelByKey[key]}: </h6>
            <ul className="pl-4 text-xs list-disc">
              {ressources[key]?.map((ressource, index) =>
                ressource.path ? (
                  <Link
                    className="hover:underline"
                    key={ressource.path}
                    to={ressource.path}
                  >
                    <li>{ressource.label}</li>
                  </Link>
                ) : (
                  <li key={`ressource-${key}-${index}`}>{ressource.label}</li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
