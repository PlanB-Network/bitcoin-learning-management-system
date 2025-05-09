import type { PDFPage, PDFPageDrawTextOptions } from 'pdf-lib';
import { rgb } from 'pdf-lib';

import {
  breakLine,
  loadPdfTemplate,
  newDocumentFromTemplate,
} from '../../pdf/utils.js';

// Load template
const pdfTemplateBytes = loadPdfTemplate('course-certificate-template');

const white = rgb(1, 1, 1); // ffffff
const orange = rgb(1, 0.361, 0); // ff5c00

interface PdfCertificateOptions {
  fullName: string;
  courseName: string;
  date: string;
  courseIndex: string;
  duration: string;
  hash: string;
  txid: string;
}

type MandatoryTextOptions = Pick<
  Required<PDFPageDrawTextOptions>,
  'font' | 'size' | 'color'
>;

type TextOptions = PDFPageDrawTextOptions & MandatoryTextOptions;

function textRight(page: PDFPage, text: string, options: TextOptions) {
  const width = page.getWidth();
  const textWidth = options.font.widthOfTextAtSize(text, options.size);
  const x = width - options.x! - textWidth;
  page.drawText(text, { ...options, x });
}

function textLeft(page: PDFPage, text: string, options: TextOptions) {
  page.drawText(text, options);
}

function textCenter(page: PDFPage, text: string, options: TextOptions) {
  const width = page.getWidth();
  const textWidth = options.font.widthOfTextAtSize(text, options.size);
  const x = width / 2 - textWidth / 2;
  page.drawText(text, { ...options, x });
}

// group hex string by 4 characters
const formatHash = (text: string) => {
  const parts = text.match(/.{1,4}/g)!;
  const hash1 = parts.slice(0, 8).join(' ');
  const hash2 = parts.slice(8).join(' ');
  return [hash1, hash2];
};

export async function createPdf(options: PdfCertificateOptions) {
  const { doc, fonts } = await newDocumentFromTemplate(pdfTemplateBytes);

  // Common options
  const conf = {
    hash: {
      size: 10.4,
      font: fonts.mono,
      color: white,
    },
    ibmPlexWhite: {
      size: 16,
      font: fonts.ibmPlexRegular,
      color: white,
    },
    courseName: {
      size: 50,
      font: fonts.ibmPlexRegular,
      color: white,
    },
    userName: {
      size: 70,
      font: fonts.styleScript,
      color: orange,
    },
  } satisfies Record<string, MandatoryTextOptions>;

  // Access the first page of the template
  const pages = doc.getPages();
  const page = pages[0];

  // Get dimensions of the first page
  const width = page.getWidth();
  const margin = 25;

  // TXID
  {
    const [txid1, txid2] = formatHash(options.txid);
    const x = margin;
    textLeft(page, txid1, { x, y: 45, ...conf.hash });
    textLeft(page, txid2, { x, y: 30, ...conf.hash });
  }

  // Certificate hash
  {
    const font = fonts.mono;
    const [hash1, hash2] = formatHash(options.hash);
    const x = width - margin - font.widthOfTextAtSize(hash1, conf.hash.size);
    textLeft(page, hash1, { x, y: 45, ...conf.hash });
    textLeft(page, hash2, { x, y: 30, ...conf.hash });
  }

  // Course ID
  textLeft(page, options.courseIndex.toUpperCase(), {
    x: margin,
    y: 104,
    ...conf.ibmPlexWhite,
  });
  textRight(page, options.duration, {
    x: margin,
    y: 104,
    ...conf.ibmPlexWhite,
  });

  // Course Name
  {
    const font = fonts.notoSansRegular;
    const text = options.courseName;
    const { size } = conf.courseName;
    const width = font.widthOfTextAtSize(text, size);
    const oneLine = width < (page.getWidth() - 2 * margin) * 0.7;

    if (oneLine) {
      textCenter(page, options.courseName, { ...conf.courseName, y: 395 });
    } else {
      const [line1, line2] = breakLine(options.courseName, font, size, false);
      textCenter(page, line1, { ...conf.courseName, y: 425, size: 48 });
      textCenter(page, line2, { ...conf.courseName, y: 370, size: 48 });
    }
  }

  // Full Name
  {
    const font = fonts.styleScript;
    const { size } = conf.userName;
    const width = font.widthOfTextAtSize(options.fullName, size);
    const oneLine = width < (page.getWidth() - 2 * margin) * 0.7;

    if (oneLine) {
      textCenter(page, options.fullName, { y: 210, ...conf.userName });
    } else {
      const [line1, line2] = breakLine(options.fullName, font, size, false);
      textCenter(page, line1, { y: 225, ...conf.userName, size: 60 });
      textCenter(page, line2, { y: 165, ...conf.userName, size: 60 });
    }
  }

  // Date
  {
    const font = fonts.notoSansRegular;
    const x = width - margin - font.widthOfTextAtSize(options.date, 16);
    textLeft(page, options.date, { x, y: 525, ...conf.ibmPlexWhite });
  }

  // Save the modified PDF
  return Buffer.from(await doc.save());
}
