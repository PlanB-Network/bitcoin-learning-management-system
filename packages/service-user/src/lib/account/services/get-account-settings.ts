import { firstRow, rejectOnEmpty } from '@blms/database';
import type { UserAccountSettings } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getUserAccountSettingsQuery } from '../queries/get-account-settings.js';

interface Options {
  uid: string;
}

export const createGetUserAccountSettings = ({ postgres }: Dependencies) => {
  return ({ uid }: Options): Promise<UserAccountSettings | null> => {
    return postgres
      .exec(getUserAccountSettingsQuery(uid))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
