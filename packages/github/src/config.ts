import dotenv from 'dotenv';

dotenv.config();

export const config = {
  github: {
    appId: process.env['GITHUB_APP_ID'],
    privateKey: process.env['GITHUB_APP_PRIVATE_KEY'],
    installationId: process.env['GITHUB_APP_INSTALLATION_ID'],
  },
  dataRepository: process.env['DATA_REPOSITORY'],
};
