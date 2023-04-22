import { z } from 'zod';

import { createProcessChangedFiles } from '@sovereign-academy/content';
import {
  processWebhookPayload,
  verifyWebhookPayload,
} from '@sovereign-academy/github';

import { publicProcedure } from '../../trpc';

export const webhooksProcedure = publicProcedure
  .meta({ openapi: { method: 'POST', path: '/github/webhooks' } })
  .input(z.object({}))
  .output(z.void())
  .mutation(async ({ ctx }) => {
    // Verify authenticity of the request
    const matchesSignature = await verifyWebhookPayload(
      process.env['GITHUB_WEBHOOK_SECRET'] || '',
      ctx.req.body,
      ctx.req.headers['x-hub-signature-256'] as string
    );

    if (!matchesSignature) {
      ctx.res.status(401).send('Invalid signature');
      return;
    }

    // We only care about push events
    if (ctx.req.headers['x-github-event'] !== 'push') {
      // Don't fail the request, but don't do anything either
      return;
    }

    // Process the payload asynchronoulsy so we don't block the request
    processWebhookPayload(ctx.req.body).then(async ({ content, sourceUrl }) => {
      const processChangedFiles = createProcessChangedFiles(ctx.dependencies);
      await processChangedFiles(content, sourceUrl);
    });
  });
