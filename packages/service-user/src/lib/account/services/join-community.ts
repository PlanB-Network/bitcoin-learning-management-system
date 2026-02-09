import type { Dependencies } from '../../../dependencies.js';
import { joinCommunityQuery } from '../queries/join-community.js';

export const createJoinCommunity = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (uid: string, communityId: string) => {
    return postgres.exec(joinCommunityQuery(uid, communityId));
  };
};
