export interface EnvConfig {
  domainUrl: string;
  sendgrid: {
    key: string | null;
    email: string | null;
    enable: boolean;
    templates: {
      emailChange: string | null;
      recoverPassword: string | null;
    };
  };
}
