export interface GitHubSyncConfig {
  cdnPath: string;
  syncPath: string;
  publicRepositoryUrl: string;
  publicRepositoryBranch: string;
  privateRepositoryUrl: string | null;
  privateRepositoryBranch: string;
  githubAccessToken: string | null;
}

export interface SendGridConfig {
  key: string | null;
  email: string | null;
  enable: boolean;
  templates: {
    emailChange: string | null;
    resetPassword: string | null;
  };
}

export interface SessionConfig {
  cookieName: string;
  secret: string;
  maxAge: number;
  secure: boolean;
  // For development under localhost, domain must not be set
  domain: string | undefined;
}

export interface StripeConfig {
  publicKey: string;
  secret: string;
  endpointSecret: string;
}

export interface EnvConfig {
  production: boolean;
  domain: string;
  domainUrl: string;
  sendgrid: SendGridConfig;
  sync: GitHubSyncConfig;
  session: SessionConfig;
  stripe: StripeConfig;
  opentimestamps: OpenTimestampsConfig;
  swissBitcoinPay: SwissBitcoinPayConfig;
}

export interface OpenTimestampsConfig {
  armoredKey: string;
  passphrase: string;
  rpc?: {
    url: string;
    user: string;
    password?: string | null;
  };
}

export interface S3Config {
  bucket: string;
  region: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
}

export interface SwissBitcoinPayConfig {
  apiKey: string | null;
  proxyUrl: string | null;
}
