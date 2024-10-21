import * as fs from 'node:fs';
import { join } from 'node:path';

import fontkit from '@pdf-lib/fontkit';
import type { PDFPage, PDFPageDrawTextOptions } from 'pdf-lib';
import { PDFDocument, rgb } from 'pdf-lib';

const dir = import.meta.dirname;

// Load template
const pdfTemplateBytes = fs.readFileSync(
  join(dir, './pdf/templates/course-certificate-template.pdf'),
);

// Load custom fonts
const fontsBytes = {
  mono: fs.readFileSync(join(dir, './pdf/fonts/JetBrainsMono.ttf')),
  rubik: fs.readFileSync(join(dir, './pdf/fonts/Rubik.ttf')),
  styleScript: fs.readFileSync(join(dir, './pdf/fonts/StyleScript.otf')),
};

const white = rgb(1, 1, 1); // ffffff
const orange = rgb(1, 0.361, 0); // ff5c00

interface PdfCertificateOptions {
  fullName: string;
  courseName: string;
  date: string;
  courseId: string;
  duration: string;
  hash: string;
  txid: string;
}

type MandatoryTextOptions = Pick<
  Required<PDFPageDrawTextOptions>,
  'font' | 'size' | 'color'
>;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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

// Split text in two lines, second line is greater than first line
const breakLine = (text: string) => {
  const courseNameArray = text.split(' ');
  const mid = Math.floor(courseNameArray.length / 2);

  const courseNameOne = courseNameArray.slice(0, mid).join(' ');
  const courseNameTwo = courseNameArray.slice(mid).join(' ');

  return [courseNameOne, courseNameTwo];
};

// group hex string by 4 characters
const formatHash = (text: string) => {
  const parts = text.match(/.{1,4}/g)!;
  const hash1 = parts.slice(0, 8).join(' ');
  const hash2 = parts.slice(8).join(' ');
  return [hash1, hash2];
};

export async function createPdf(options: PdfCertificateOptions) {
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  pdfDoc.registerFontkit(fontkit);

  // Fonts
  const fonts = {
    style: await pdfDoc.embedFont(fontsBytes.styleScript),
    rubik: await pdfDoc.embedFont(fontsBytes.rubik),
    mono: await pdfDoc.embedFont(fontsBytes.mono),
  };

  // Common options
  const conf = {
    hash: {
      size: 10.4,
      font: fonts.mono,
      color: white,
    },
    rubikWhite: {
      size: 16,
      font: fonts.rubik,
      color: white,
    },
    courseName: {
      size: 50,
      font: fonts.rubik,
      color: white,
    },
    userName: {
      size: 70,
      font: fonts.style,
      color: orange,
    },
  } satisfies Record<string, MandatoryTextOptions>;

  // Access the first page of the template
  const pages = pdfDoc.getPages();
  const page = pages[0];

  // Display dimensions of the first page
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
  textLeft(page, options.courseId, { x: margin, y: 104, ...conf.rubikWhite });

  // Duration
  {
    textRight(page, options.duration, {
      x: margin,
      y: 104,
      ...conf.rubikWhite,
    });
  }

  // Course Name
  {
    const font = fonts.rubik;
    const text = options.courseName;
    const { size } = conf.courseName;
    const width = font.widthOfTextAtSize(text, size);
    const oneLine = width < (page.getWidth() - 2 * margin) * 0.7;

    if (oneLine) {
      textCenter(page, options.courseName, { ...conf.courseName, y: 395 });
    } else {
      const [line1, line2] = breakLine(options.courseName);
      textCenter(page, line1, { ...conf.courseName, y: 425, size: 48 });
      textCenter(page, line2, { ...conf.courseName, y: 370, size: 48 });
    }
  }

  // Full Name
  {
    const font = fonts.style;
    const { size } = conf.userName;
    const width = font.widthOfTextAtSize(options.fullName, size);
    const oneLine = width < (page.getWidth() - 2 * margin) * 0.7;

    if (oneLine) {
      textCenter(page, options.fullName, { y: 210, ...conf.userName });
    } else {
      const [line1, line2] = breakLine(options.fullName);
      textCenter(page, line1, { y: 225, ...conf.userName, size: 60 });
      textCenter(page, line2, { y: 165, ...conf.userName, size: 60 });
    }
  }

  // Date
  {
    const font = fonts.rubik;
    const x = width - margin - font.widthOfTextAtSize(options.date, 16);
    textLeft(page, options.date, { x, y: 525, ...conf.rubikWhite });
  }

  // Save the modified PDF
  return Buffer.from(await pdfDoc.save());
}
