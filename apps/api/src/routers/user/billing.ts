import { invoiceSchema, ticketSchema } from '@sovereign-university/schemas';
import {
  createGetInvoices,
  createGetTickets,
} from '@sovereign-university/user';

import { protectedProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getInvoicesProcedure = protectedProcedure
  .output(invoiceSchema.array())
  .query(({ ctx }) =>
    createGetInvoices(ctx.dependencies)({
      uid: ctx.user.uid,
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
