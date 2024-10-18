import { z } from 'zod';

import { invoiceSchema, ticketSchema } from '@blms/schemas';
import {
  createGetExamTickets,
  createGetInvoices,
  createGetTickets,
} from '@blms/service-user';
import type { Invoice, Ticket } from '@blms/types';

import type { Parser } from '#src/trpc/types.js';

import { studentProcedure } from '../../procedures/index.js';
import { createTRPCRouter } from '../../trpc/index.js';

const getInvoicesProcedure = studentProcedure
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

const getExamTicketsProcedure = studentProcedure
  .input(z.void())
  .output<Parser<Ticket[]>>(ticketSchema.array())
  .query(({ ctx }) =>
    createGetExamTickets(ctx.dependencies)({
      uid: ctx.user.uid,
    }),
  );

const getTicketsProcedure = studentProcedure
  .output<Parser<Ticket[]>>(ticketSchema.array())
  .query(({ ctx }) =>
    createGetTickets(ctx.dependencies)({
      uid: ctx.user.uid,
    }),
  );

export const userBillingRouter = createTRPCRouter({
  getExamTickets: getExamTicketsProcedure,
  getInvoices: getInvoicesProcedure,
  getTickets: getTicketsProcedure,
});
