import fs from 'node:fs';
import { join } from 'node:path';

import { fontsBytes } from '@blms/service-common/fonts';
import fontkit from '@pdf-lib/fontkit';
import type { PDFFont } from 'pdf-lib';
import { PDFDocument } from 'pdf-lib';

const dir = import.meta.dirname;

export const loadPdfTemplate = (name: string) => {
  return fs.readFileSync(join(dir, `./templates/${name}.pdf`));
};

export const loadTxtTemplate = (name: string) => {
  return fs.readFileSync(join(dir, `./templates/${name}.txt`), 'utf8');
};

export const newDocumentFromTemplate = async (buf: Buffer) => {
  const doc = await PDFDocument.load(buf);

  doc.registerFontkit(fontkit);

  const fonts = {
    ibmPlexBold: await doc.embedFont(fontsBytes.ibmPlexBold),
    ibmPlexLight: await doc.embedFont(fontsBytes.ibmPlexLight),
    ibmPlexMedium: await doc.embedFont(fontsBytes.ibmPlexMedium),
    ibmPlexRegular: await doc.embedFont(fontsBytes.ibmPlexRegular),
    ibmPlexSemiBold: await doc.embedFont(fontsBytes.ibmPlexSemiBold),
    mono: await doc.embedFont(fontsBytes.mono),
    notoSansBold: await doc.embedFont(fontsBytes.notoSansBold),
    notoSansLight: await doc.embedFont(fontsBytes.notoSansLight),
    notoSansMedium: await doc.embedFont(fontsBytes.notoSansMedium),
    notoSansRegular: await doc.embedFont(fontsBytes.notoSansRegular),
    notoSansSemiBold: await doc.embedFont(fontsBytes.notoSansSemiBold),
    styleScript: await doc.embedFont(fontsBytes.styleScript),
  };

  return { doc, fonts };
};

// Split text in two lines, first line is greater than second line
// if firstLarger is true, otherwise second line is greater than first line
export const breakLine = (
  text: string,
  font: PDFFont,
  size: number,
  firstLarger = true,
) => {
  const arr = text.split(' ');
  let shift = firstLarger ? 0 : arr.length;

  let t1 = '';
  let t2 = '';
  let w1 = 0;
  let w2 = 0;

  do {
    t1 = arr.slice(0, shift).join(' ');
    t2 = arr.slice(shift).join(' ');

    w1 = font.widthOfTextAtSize(t1, size);
    w2 = font.widthOfTextAtSize(t2, size);

    shift += firstLarger ? 1 : -1;
  } while (firstLarger ? w1 < w2 : w1 > w2);

  return [t1, t2];
};

// Split text in multiple lines (as much as needed)
export const breakLines = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) => {
  const arr = text.split(' ');
  const lines: string[] = [];

  let line = '';

  for (const word of arr) {
    const newLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(newLine, size);

    if (width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = newLine;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
};
