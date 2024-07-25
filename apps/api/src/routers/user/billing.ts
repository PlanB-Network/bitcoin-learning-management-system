import { z } from 'zod';

import { invoiceSchema, ticketSchema } from '@blms/schemas';
import type { Invoice, Ticket } from '@blms/types';
import { createGetInvoices, createGetTickets } from '@blms/user';

import type { Parser } from '#src/trpc/types.js';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getInvoicesProcedure = protectedProcedure
  .input(
    z.object({
      language: z.string(),
    }),
  )
  .output<Parser<Invoice[]>>(invoiceSchema.array())
  .query(({ ctx, input }) =>
    createGetInvoices(ctx.dependencies)({
      uid: ctx.user.uid,
      language: input.language,
    }),
  );

const getTicketsProcedure = protectedProcedure
  .output<Parser<Ticket[]>>(ticketSchema.array())
  .query(({ ctx }) =>
    createGetTickets(ctx.dependencies)({
      uid: ctx.user.uid,
    }),
  );

export const userBillingRouter = createTRPCRouter({
  getInvoices: getInvoicesProcedure,
  getTickets: getTicketsProcedure,
});
