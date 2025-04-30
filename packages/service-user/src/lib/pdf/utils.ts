import fs from 'node:fs';
import { join } from 'node:path';

import { fontsBytes } from '@blms/service-common/fonts';
import fontkit from '@pdf-lib/fontkit';
import type { EmbedFontOptions, PDFFont } from 'pdf-lib';
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

  const options: EmbedFontOptions = { subset: true, features: { aalt: true } };
  const addFont = ((buf: Buffer) => doc.embedFont(buf, options)).bind(doc);

  const fonts = {
    styleScript: await addFont(fontsBytes.styleScript),
    ibmPlexLight: await addFont(fontsBytes.ibmPlexLight),
    ibmPlexRegular: await addFont(fontsBytes.ibmPlexRegular),
    ibmPlexMedium: await addFont(fontsBytes.ibmPlexMedium),
    ibmPlexSemiBold: await addFont(fontsBytes.ibmPlexSemiBold),
    ibmPlexBold: await addFont(fontsBytes.ibmPlexBold),
    mono: await addFont(fontsBytes.mono),
    notoSansLight: await addFont(fontsBytes.notoSansLight),
    notoSansRegular: await addFont(fontsBytes.notoSansRegular),
    notoSansMedium: await addFont(fontsBytes.notoSansMedium),
    notoSansSemiBold: await addFont(fontsBytes.notoSansSemiBold),
    notoSansBold: await addFont(fontsBytes.notoSansBold),
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
