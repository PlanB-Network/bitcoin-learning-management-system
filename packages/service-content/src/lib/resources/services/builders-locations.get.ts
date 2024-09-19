import type { BuilderLocation } from '@blms/types';

import type { Dependencies } from '../../dependencies.js';
import { getBuildersLocationsQuery } from '../queries/builders-locations.js';

export const createGetBuildersLocations = ({ postgres }: Dependencies) => {
  return (): Promise<BuilderLocation[]> => {
    return postgres.exec(getBuildersLocationsQuery());
  };
};
