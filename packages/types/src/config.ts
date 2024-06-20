export interface GitHubSyncConfig {
  cdnPath: string;
  syncPath: string;
  publicRepositoryUrl: string;
  publicRepositoryBranch: string;
  privateRepositoryUrl?: string | null;
  privateRepositoryBranch: string;
  githubAccessToken?: string | null;
}

export interface SendGridConfig {
  key: string | null;
  email: string | null;
  enable: boolean;
  templates: {
    emailChange: string | null;
    recoverPassword: string | null;
  };
}

export interface EnvConfig {
  domainUrl: string;
  sendgrid: SendGridConfig;
  sync: GitHubSyncConfig;
}
