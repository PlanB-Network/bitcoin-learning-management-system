import { z } from 'zod';

import { invoiceSchema, ticketSchema } from '@sovereign-university/schemas';
import {
  createGetInvoices,
  createGetTickets,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getInvoicesProcedure = protectedProcedure
  .input(
    z.object({
      language: z.string(),
    }),
  )
  .output(invoiceSchema.array())
  .query(({ ctx, input }) =>
    createGetInvoices(ctx.dependencies)({
      uid: ctx.user.uid,
      language: input.language,
    }),
  );

const getTicketsProcedure = protectedProcedure
  .output(ticketSchema.array())
  .query(({ ctx }) =>
    createGetTickets(ctx.dependencies)({
      uid: ctx.user.uid,
    }),
  );

export const userBillingRouter = createTRPCRouter({
  getInvoices: getInvoicesProcedure,
  getTickets: getTicketsProcedure,
});
