import type { PDFPageDrawTextOptions } from 'pdf-lib';
import { rgb } from 'pdf-lib';
import { imageSync } from 'qr-image';

import {
  breakLine,
  loadPdfTemplate,
  newDocumentFromTemplate,
} from './utils.js';

export interface GenerateTicketOptions {
  title: string;
  addressLine1: string;
  addressLine2?: string | null;
  addressLine3?: string | null;
  formattedStartDate?: string;
  formattedTime?: string;
  liveLanguage: string | null;
  formattedCapacity?: string;
  userName: string;
  purchaseDate?: string | null;
  ticketNumber?: string | null;
}

const pdfTemplateBytes = loadPdfTemplate('ticket-template');

const grey = rgb(0.5, 0.5, 0.5); // 808080

export async function generateTicket(options: GenerateTicketOptions) {
  void options;

  const { doc, fonts } = await newDocumentFromTemplate(pdfTemplateBytes);

  const conf = {
    small: {
      size: 10,
      font: fonts.rubikLight,
    },
    normal: {
      size: 14,
      font: fonts.rubikRegular,
      lineHeight: 20,
    },
    title: {
      size: 20,
      font: fonts.rubikSemiBold,
      lineHeight: 24,
    },
    location: {
      size: 14,
      font: fonts.rubikMedium,
      lineHeight: 20,
    },
    duration: {
      size: 12,
      font: fonts.rubikRegular,
      lineHeight: 16,
    },
    muted: {
      size: 12,
      font: fonts.rubikRegular,
      color: grey,
      lineHeight: 16,
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

  // Location
  {
    const { lineHeight } = conf.location;
    const { addressLine1: t1, addressLine2: t2, addressLine3: t3 } = options;
    const x = margin;
    const y = height - 280 + (t3 ? lineHeight / 2 : 0);

    if (t1) {
      page.drawText(t1, { x, y, ...conf.location });
      page.drawText(t2 ?? '', { x, y: y - lineHeight, ...conf.location });

      if (t3) {
        page.drawText(t3, { x, y: y - lineHeight * 2, ...conf.location });
      }
    }
  }

  // Date and duration
  {
    const { lineHeight } = conf.duration;
    const { formattedStartDate, formattedTime, addressLine3 } = options;
    const x = margin;
    const y = height - 280 - 50 - (addressLine3 ? lineHeight / 3 : 0);

    if (formattedStartDate) {
      page.drawText(formattedStartDate, { x, y, ...conf.duration });
    }

    if (formattedTime) {
      page.drawText(formattedTime, { x, y: y - lineHeight, ...conf.duration });
    }
  }

  // Instructions
  {
    const { lineHeight } = conf.muted;
    const { liveLanguage, formattedCapacity } = options;
    const x = margin;
    const y = height - 280 - 50 - 50;

    if (liveLanguage) {
      page.drawText(liveLanguage, { x, y, ...conf.muted });
    }

    if (formattedCapacity) {
      page.drawText(formattedCapacity, { x, y: y - lineHeight, ...conf.muted });
    }
  }

  // Ticket number / purchase date
  {
    const { ticketNumber, purchaseDate } = options;
    const x = margin + 330;
    const y = height - 480;
    const labels = {
      ...conf.small,
      font: fonts.rubikMedium,
    };

    if (ticketNumber) {
      const label = 'Ticket number:';
      const w = labels.font.widthOfTextAtSize(label, labels.size);
      page.drawText(label, { x, y, ...labels });
      page.drawText(ticketNumber, { x: x + w + 5, y, ...conf.small });
    }

    if (purchaseDate) {
      const label = 'Purchased on:';
      const w = labels.font.widthOfTextAtSize(label, labels.size);
      const config = { x, y: y - (ticketNumber ? 16 : 0), ...conf.small };
      page.drawText(label, { ...config, ...labels });
      page.drawText(purchaseDate, { ...config, x: x + w + 5 });
    }
  }

  // Display name
  {
    const { userName } = options;
    const x = margin + 322;
    const y = height - 280;

    const label = 'Display name:';

    const config = { x, y, ...conf.normal };

    page.drawText(label, { ...config, font: fonts.rubikSemiBold });
    page.drawText(userName, { ...config, y: y - 20 });
  }

  // QR code
  {
    const png = imageSync(options.userName, {
      type: 'png',
      margin: 2,
    });

    const qr = await doc.embedPng(png);
    const x = margin + 322;
    const y = height - 500;
    const size = 180;

    page.drawImage(qr, { x, y, width: size, height: size });
  }

  return Buffer.from(await doc.save());
}
