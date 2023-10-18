import { Dependencies } from '../../dependencies';
import { getTutorialsQuery } from '../queries';

export const createGetTutorials =
  (dependencies: Dependencies) =>
  async (category?: string, language?: string) => {
    const { postgres } = dependencies;

    const tutorials = await postgres.exec(
      getTutorialsQuery(category, language),
    );

    return [...tutorials];
  };
