import { z } from 'zod';

import { invoiceSchema, ticketSchema } from '@blms/schemas';
import {
  createCancelTicket,
  createGetExamTickets,
  createGetInvoices,
  createGetTickets,
} from '@blms/service-user';
import type { Invoice, Ticket } from '@blms/types';

import { studentProcedure } from '#src/procedures/protected.js';
import { createTRPCRouter } from '#src/trpc/index.js';
import type { Parser } from '#src/trpc/types.js';

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

const cancelTicketProcedure = studentProcedure
  .input(
    z.object({
      ticketId: z.string(),
      eventType: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createCancelTicket(ctx.dependencies)({
      uid: ctx.user.uid,
      ticketId: input.ticketId,
      eventType: input.eventType,
    }),
  );

export const userBillingRouter = createTRPCRouter({
  getExamTickets: getExamTicketsProcedure,
  getInvoices: getInvoicesProcedure,
  getTickets: getTicketsProcedure,
  cancelTicket: cancelTicketProcedure,
});
