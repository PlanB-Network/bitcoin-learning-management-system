import { z } from 'zod';

export const invoiceSchema = z.object({
  title: z.string(),
  type: z.string(),
  date: z.date(),
});

export const ticketSchema = z.object({
  title: z.string(),
  location: z.string(),
  type: z.string(),
  date: z.date(),
  isInPerson: z.boolean(),
});
