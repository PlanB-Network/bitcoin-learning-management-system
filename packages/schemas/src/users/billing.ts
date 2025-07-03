import { z } from 'zod';

export const invoiceSchema = z.object({
  amount: z.number(),
  date: z.date(),
  paymentMethod: z.string(),
  title: z.string(),
  type: z.string(),
  url: z.string(),
});

export const ticketSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string(),
  addressLine3: z.string(),
  date: z.date(),
  eventId: z.string(),
  isInPerson: z.boolean(),
  isOnline: z.boolean(),
  isPaid: z.boolean().optional(),
  location: z.string(),
  timezone: z.string().nullable(),
  title: z.string(),
  type: z.string(),
});
