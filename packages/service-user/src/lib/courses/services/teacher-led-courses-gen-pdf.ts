import type { PDFPage, PDFPageDrawTextOptions } from 'pdf-lib';
import { rgb } from 'pdf-lib';
import sharp from 'sharp';

import {
  breakLine,
  loadPdfTemplate,
  newDocumentFromTemplate,
} from '../../pdf/utils.js';

// Load template
const pdfTemplateBytes = loadPdfTemplate(
  'teacher-led-courses-diploma-template',
);

const grey3 = rgb(0.698, 0.698, 0.698); // b2b2b2
const black = rgb(0, 0, 0); // 000000
const black3 = rgb(0.2, 0.2, 0.2); // #333333
const orange = rgb(1, 0.361, 0); // ff5c00

interface PdfCertificateOptions {
  fullName: string;
  courseName: string;
  courseFormat: 'online' | 'inperson' | 'hybrid';
  courseProvider: string;
  courseProviderLogo?: string;
  date: string;
  hash: string;
  txid: string;
}

type MandatoryTextOptions = Pick<
  Required<PDFPageDrawTextOptions>,
  'font' | 'size' | 'color'
>;

type TextOptions = PDFPageDrawTextOptions & MandatoryTextOptions;

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
  return text.match(/.{1,4}/g)!.join(' ');
};

export async function createTeacherLedCertificatePdf(
  options: PdfCertificateOptions,
) {
  const { doc, fonts } = await newDocumentFromTemplate(pdfTemplateBytes);

  console.log('Creating teacher-led course certificate PDF...', options);

  // Common options
  const conf = {
    hash: {
      size: 10.4,
      font: fonts.mono,
      color: grey3,
    },
    default: {
      size: 16,
      font: fonts.ibmPlexRegular,
      color: black,
    },
    courseName: {
      size: 36,
      font: fonts.ibmPlexLight,
      color: black,
    },
    userName: {
      size: 48,
      font: fonts.styleScript,
      color: orange,
    },
    authors: {
      size: 12,
      font: fonts.ibmPlexLight,
      color: black3,
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
    const txid = `Timestamp TxID: ${formatHash(options.txid)}`;
    const x = margin;
    textCenter(page, txid, { x, y: 50, ...conf.hash });
  }

  // // PGP Public Key
  // {
  //   const hash = `Plan ₿ Network Public Key: ${formatHash(options.pgpPublicKey)}`;
  //   const x = margin;
  //   textCenter(page, hash, { x, y: 40, ...conf.hash });
  // }

  // Certificate hash
  {
    const hash = `Certificate hash: ${formatHash(options.hash)}`;
    const x = margin;
    textCenter(page, hash, { x, y: 35, ...conf.hash });
  }

  // Full Name
  {
    const font = fonts.styleScript;
    const { size } = conf.userName;
    const width = font.widthOfTextAtSize(options.fullName, size);
    const oneLine = width < (page.getWidth() - 2 * margin) * 0.7;

    if (oneLine) {
      textCenter(page, options.fullName, { y: 360, ...conf.userName });
    } else {
      const [line1, line2] = breakLine(options.fullName, font, size, false);
      textCenter(page, line1, { y: 395, ...conf.userName });
      textCenter(page, line2, { y: 340, ...conf.userName });
    }
  }

  let courseNameOneLine = true;

  // Course Name
  {
    const font = fonts.notoSansRegular;
    const text = options.courseName;
    const { size } = conf.courseName;
    const width = font.widthOfTextAtSize(text, size);
    courseNameOneLine = width < (page.getWidth() - 2 * margin) * 0.8;

    if (courseNameOneLine) {
      textCenter(page, options.courseName, { ...conf.courseName, y: 245 });
    } else {
      const [line1, line2] = breakLine(options.courseName, font, size, false);
      textCenter(page, line1, { ...conf.courseName, y: 240 });
      textCenter(page, line2, { ...conf.courseName, y: 190 });
    }
  }

  // Authors / Course Provider
  {
    let text =
      options.courseFormat === 'online'
        ? 'an online'
        : options.courseFormat === 'inperson'
          ? 'an in-person'
          : 'an online and in-person';

    text += ` course created by ${options.courseProvider} and offered through Plan ₿ Network`;

    if (courseNameOneLine) {
      textCenter(page, text, { ...conf.authors, y: 200 });
    } else {
      textCenter(page, text, { ...conf.authors, y: 150 });
    }
  }

  // Course Provider Logo
  if (options.courseProviderLogo) {
    // Course Provider Logo
    const maxWidth = 200;
    const maxHeight = 100;

    const logo = await fetch(options.courseProviderLogo);
    const bytes = await logo.arrayBuffer();
    const resized = await sharp(Buffer.from(bytes))
      .resize({
        width: maxWidth * 5,
        height: maxHeight * 5,
        fit: 'inside', // Preserve ratio
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    const image = await doc.embedPng(resized);

    const boxTopY = 420;
    const imageRatio = image.width / image.height;
    let finalWidth = 0;
    let finalHeight = 0;

    if (imageRatio > maxWidth / maxHeight) {
      finalWidth = maxWidth;
      finalHeight = maxWidth / imageRatio;
    } else {
      finalHeight = maxHeight;
      finalWidth = maxHeight * imageRatio;
    }

    const drawY = boxTopY + (maxHeight - finalHeight);

    page.drawImage(image, {
      x: margin + 10,
      y: drawY,
      width: finalWidth,
      height: finalHeight,
    });
  } else {
    textLeft(page, options.courseProvider, {
      ...conf.courseName,
      y: 475,
      x: margin + 25,
    });
  }

  // Date
  {
    const font = fonts.notoSansRegular;
    const date = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
      new Date(options.date),
    );

    const x = width - margin - font.widthOfTextAtSize(date, 12);
    textCenter(page, date, { x, y: 85, ...conf.default, size: 12 });
  }

  // Save the modified PDF
  return Buffer.from(await doc.save());
}
