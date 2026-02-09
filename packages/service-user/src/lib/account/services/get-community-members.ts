import type { Dependencies } from '../../../dependencies.js';
import { getCommunityMembersQuery } from '../queries/get-community-members.js';

export const createGetCommunityMembers = ({
  postgres,
}: Pick<Dependencies, 'postgres'>) => {
  return (communityId: string) => {
    return postgres.exec(getCommunityMembersQuery(communityId));
  };
};
