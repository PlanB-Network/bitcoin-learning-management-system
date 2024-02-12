import { Dependencies } from '../../dependencies.js';
import { getTutorialsQuery } from '../queries/index.js';

export const createGetTutorials =
  (dependencies: Dependencies) =>
  async (category?: string, language?: string) => {
    const { postgres } = dependencies;

    const tutorials = await postgres.exec(
      getTutorialsQuery(category, language),
    );

    return [...tutorials];
  };
