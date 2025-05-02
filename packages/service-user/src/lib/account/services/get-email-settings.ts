import { firstRow, rejectOnEmpty } from '@blms/database';
import type { EmailSettings } from '@blms/types';
import type { Dependencies } from '../../../dependencies.js';
import { getEmailSettingsQuery } from '../queries/get-email-settings.js';

interface Options {
  unsubscribeId: string;
}

export const createGetEmailSettings = ({ postgres }: Dependencies) => {
  return ({ unsubscribeId }: Options): Promise<EmailSettings | null> => {
    return postgres
      .exec(getEmailSettingsQuery(unsubscribeId))
      .then(firstRow)
      .then(rejectOnEmpty);
  };
};
