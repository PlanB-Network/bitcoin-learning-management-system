import { firstRow } from '@blms/database';
import type { JoinedMovie } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getMovieQuery } from '../queries/get-movie.js';

export const createGetMovie = ({ postgres }: Dependencies) => {
  return async (id: string): Promise<JoinedMovie> => {
    const movie = await postgres.exec(getMovieQuery(id)).then(firstRow);

    if (!movie) {
      throw new Error('Movie not found');
    }

    return movie;
  };
};
