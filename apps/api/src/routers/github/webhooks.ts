// import { z } from 'zod';

// import { createProcessChangedFiles } from '@sovereign-university/content';
// import {
//   processWebhookPayload,
//   verifyWebhookPayload,
// } from '@sovereign-university/github';

// import { publicProcedure } from '../../procedures/index.js';

// export const webhooksProcedure = publicProcedure
//   .input(z.object({}))
//   .output(z.void())
//   .mutation(async ({ ctx }) => {
//     // Verify authenticity of the request
//     const matchesSignature = await verifyWebhookPayload(
//       process.env['GITHUB_WEBHOOK_SECRET'] || '',
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//       ctx.req.body,
//       ctx.req.headers['x-hub-signature-256'] as string,
//     );

//     if (!matchesSignature) {
//       ctx.res.status(401).send('Invalid signature');
//       return;
//     }

//     // We only care about push events
//     if (ctx.req.headers['x-github-event'] !== 'push') {
//       // Don't fail the request, but don't do anything either
//       return;
//     }

//     // Process the payload asynchronoulsy so we don't block the request
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
//     void processWebhookPayload(ctx.req.body).then(async (files) => {
//       // eslint-disable-next-line promise/always-return
//       try {
//         const processChangedFiles = createProcessChangedFiles(ctx.dependencies);
//         await processChangedFiles(files);
//       } catch (error) {
//         console.error(
//           `Error processing webhook payload. ${
//             error instanceof Error ? error.message : ''
//           }`,
//         );
//       }
//     });
//   });
