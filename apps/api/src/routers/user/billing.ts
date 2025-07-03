import { invoiceSchema, ticketSchema } from '@blms/schemas';
import {
  createCancelTicket,
  createGetExamTickets,
  createGetInvoices,
  createGetTickets,
} from '@blms/service-user';
import type { Invoice, Ticket } from '@blms/types';
import { z } from 'zod';

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
      language: input.language,
      uid: ctx.user.uid,
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
      eventType: z.string(),
      ticketId: z.string(),
    }),
  )
  .output<Parser<void>>(z.void())
  .mutation(({ ctx, input }) =>
    createCancelTicket(ctx.dependencies)({
      eventType: input.eventType,
      ticketId: input.ticketId,
      uid: ctx.user.uid,
    }),
  );

export const userBillingRouter = createTRPCRouter({
  cancelTicket: cancelTicketProcedure,
  getExamTickets: getExamTicketsProcedure,
  getInvoices: getInvoicesProcedure,
  getTickets: getTicketsProcedure,
});
