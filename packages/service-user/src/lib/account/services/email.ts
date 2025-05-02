import type { Dependencies } from '#src/dependencies.js';

interface SendEmailOptions<TData extends object> {
  email: string;
  subject: string;
  template: string;
  data: TData;
}

export const createSendEmail = ({ config }: Pick<Dependencies, 'config'>) => {
  return async ({ email, subject, ...options }: SendEmailOptions<object>) => {
    if (!config.sendgrid.enable) {
      console.log('Email sending disabled');
      console.debug('Email:', { email, subject, options });
      return;
    }

    if (!config.sendgrid.key) {
      throw new Error('Missing SendGrid key');
    }

    if (!config.sendgrid.email) {
      throw new Error('Missing SendGrid email');
    }

    return fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.sendgrid.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        from: {
          email: config.sendgrid.email,
          name: 'PlanB Network',
        },
        template_id: options.template,
        personalizations: [
          {
            to: [{ email }],
            dynamic_template_data: options.data,
          },
        ],
      }),
    });
  };
};
