import fs from 'node:fs';
import { join } from 'node:path';

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

export const fontsBytes = {
  mono: fs.readFileSync(join(dir, './fonts/mono/JetBrainsMono.ttf')),
  ibmPlexLight: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Light.ttf'),
  ),
  ibmPlexRegular: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Regular.ttf'),
  ),
  ibmPlexMedium: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Medium.ttf'),
  ),
  ibmPlexSemiBold: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-SemiBold.ttf'),
  ),
  ibmPlexBold: fs.readFileSync(
    join(dir, './fonts/ibm-plex/IBMPlexSans-Bold.ttf'),
  ),
  styleScript: fs.readFileSync(join(dir, './fonts/StyleScript.otf')),
};

export const newDocumentFromTemplate = async (buf: Buffer) => {
  const doc = await PDFDocument.load(buf);

  doc.registerFontkit(fontkit);

  const fonts = {
    styleScript: await doc.embedFont(fontsBytes.styleScript),
    ibmPlexLight: await doc.embedFont(fontsBytes.ibmPlexLight),
    ibmPlexRegular: await doc.embedFont(fontsBytes.ibmPlexRegular),
    ibmPlexMedium: await doc.embedFont(fontsBytes.ibmPlexMedium),
    ibmPlexSemiBold: await doc.embedFont(fontsBytes.ibmPlexSemiBold),
    ibmPlexBold: await doc.embedFont(fontsBytes.ibmPlexBold),
    mono: await doc.embedFont(fontsBytes.mono),
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
