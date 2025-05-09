import type { PDFPageDrawTextOptions } from 'pdf-lib';
import { imageSync } from 'qr-image';

import {
  breakLine,
  loadPdfTemplate,
  newDocumentFromTemplate,
} from './utils.js';

export interface GenerateTicketOptions {
  title: string;
  organizer?: string;
  addressLine1: string;
  addressLine2?: string | null;
  addressLine3?: string | null;
  formattedStartDate?: string;
  formattedTime?: string;
  liveLanguage: string | null;
  availableSeats?: number | null;
  userName: string;
  purchaseDate?: string | null;
  ticketNumber?: string | null;
}

const pdfTemplateBytes = loadPdfTemplate('ticket-template');

export async function generateTicket(options: GenerateTicketOptions) {
  void options;

  const { doc, fonts } = await newDocumentFromTemplate(pdfTemplateBytes);

  const conf = {
    title: {
      size: 20,
      font: fonts.ibmPlexSemiBold,
      lineHeight: 24,
    },
    normal: {
      size: 14,
      font: fonts.ibmPlexMedium,
      lineHeight: 20,
    },
    small: {
      size: 12,
      font: fonts.ibmPlexMedium,
      lineHeight: 16,
    },
    xs: {
      size: 10,
      font: fonts.ibmPlexLight,
    },
  } satisfies Record<string, PDFPageDrawTextOptions>;

  // Access the first page of the template
  const pages = doc.getPages();
  const page = pages[0];

  // Get dimensions of the first page
  const { width, height } = page.getSize();
  const margin = width / 20;

  console.log({ width, height, margin });

  // Course name
  {
    const text = options.title ?? '?';
    const { font, size, lineHeight } = conf.title;
    const x = margin;
    const y = height - font.heightAtSize(size) - 180;
    const titleWidth = font.widthOfTextAtSize(text, size);
    const oneLine = titleWidth < width * 0.4;

    if (oneLine) {
      page.drawText(text, { x, y, ...conf.title });
    } else {
      const [line1, line2] = breakLine(text, font, size);
      const y1 = y + lineHeight / 2;
      const y2 = y - lineHeight / 2;
      page.drawText(line1, { x, y: y1, ...conf.title });
      page.drawText(line2, { x, y: y2, ...conf.title });
    }
  }

  // Organizer
  {
    const text = options.organizer ?? '';
    const { font, size } = conf.normal;
    const x = margin + 85;
    const y = height - font.heightAtSize(size) - 238;
    page.drawText(text, { x, y, ...conf.normal });
  }

  // Location
  {
    const { lineHeight } = conf.normal;
    const { addressLine1: t1, addressLine2: t2, addressLine3: t3 } = options;
    const x = margin;
    const y = height - 330 + (t3 ? lineHeight / 2 : 0);

    if (t2) {
      page.drawText(t2, { x, y: y, ...conf.normal });
    }

    if (t3) {
      page.drawText(t3, { x, y: y - lineHeight, ...conf.normal });
    }

    if (t1) {
      page.drawText(t1, { x, y: y - lineHeight * 2, ...conf.normal });
    }
  }

  // Date and duration
  {
    const { lineHeight } = conf.normal;
    const { formattedStartDate, formattedTime, addressLine3 } = options;
    const x = margin;
    const y = height - 442 - (addressLine3 ? lineHeight / 3 : 0);

    if (formattedStartDate) {
      page.drawText(formattedStartDate, { x, y, ...conf.normal });
    }

    if (formattedTime) {
      page.drawText(formattedTime, { x, y: y - lineHeight, ...conf.normal });
    }
  }

  // Language
  {
    const { liveLanguage } = options;
    const x = margin + 65;
    const y = height - 516;

    if (liveLanguage) {
      page.drawText(liveLanguage, { x, y, ...conf.small });
    }
  }

  // Capacity
  {
    const { lineHeight } = conf.small;
    const { availableSeats } = options;
    const x = margin + 115;
    const y = height - 523;

    if (availableSeats) {
      const text = `${availableSeats} people`;
      page.drawText(text, { x, y: y - lineHeight, ...conf.small });
    }
  }

  // Ticket number / purchase date
  {
    const { ticketNumber, purchaseDate } = options;
    const x = margin + 330;
    const y = height - 480;
    const labels = {
      ...conf.xs,
      font: fonts.ibmPlexMedium,
    };

    if (ticketNumber) {
      const label = 'Ticket number:';
      const w = labels.font.widthOfTextAtSize(label, labels.size);
      page.drawText(label, { x, y, ...labels });
      page.drawText(ticketNumber, { x: x + w + 5, y, ...conf.xs });
    }

    if (purchaseDate) {
      const label = 'Purchased on:';
      const w = labels.font.widthOfTextAtSize(label, labels.size);
      const config = { x, y: y - (ticketNumber ? 16 : 0), ...conf.xs };
      page.drawText(label, { ...config, ...labels });
      page.drawText(purchaseDate, { ...config, x: x + w + 5 });
    }
  }

  // Display name
  {
    const { userName } = options;
    const x = margin + 355;
    const y = height - 230;

    const config = { x, y, ...conf.normal };
    page.drawText(userName, { ...config, y: y });
  }

  // QR code
  {
    const png = imageSync(options.userName, {
      type: 'png',
      margin: 2,
    });

    const qr = await doc.embedPng(png);
    const x = margin + 355;
    const y = height - 415;
    const size = 170;

    page.drawImage(qr, { x, y, width: size, height: size });
  }

  return Buffer.from(await doc.save());
}
