import type { Dependencies } from '../../../dependencies.js';
import { leaveCommunityQuery } from '../queries/leave-community.js';

export const createLeaveCommunity = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (uid: string) => {
    return postgres.exec(leaveCommunityQuery(uid));
  };
};
