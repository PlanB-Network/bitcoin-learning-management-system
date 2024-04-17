import fs from 'node:fs';

import PDFDocument from 'pdfkit';

const doc = new PDFDocument();
let x = 0;
let y = 0;

function print(content: string | null | undefined) {
  if (content) {
    doc.text(content, x, y);
  }
}

function printAndMove(content: string | null | undefined) {
  if (content) {
    doc.text(content, x, y);
    y += 20;
  }
}

export const generateChapterTicket = async ({
  title,
  addressLine1,
  addressLine2,
  addressLine3,
  formattedStartDate,
  formattedTime,
  liveLanguage,
  formattedCapacity,
}: {
  title?: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  formattedStartDate?: string;
  formattedTime?: string;
  liveLanguage: string | null;
  formattedCapacity?: string;
}) => {
  const chunks: Buffer[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  doc.on('data', (chunk) => chunks.push(chunk));

  return new Promise<string>((resolve, reject) => {
    doc.on('end', () => {
      const result = Buffer.concat(chunks).toString('base64');
      resolve(result);
    });

    doc.on('error', reject);

    const logoPath = './src/assets/pdf-header.png';
    console.log(process.cwd());
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 0, 0, { width: 615 });
        //doc.moveDown(1.5);
      } else {
        console.warn('Logo file not found, skipping logo insertion.');
      }
    } catch (error) {
      console.error('Failed to add image:', error);
    }

    x = 20;
    y = 180;

    doc.fontSize(20).font('Helvetica-Bold');
    print(title);
    y += 30;

    doc.fontSize(12).font('Helvetica');
    print('organised by Plan B Network');
    y += 50;

    doc.fontSize(14).font('Helvetica-Bold');
    printAndMove(addressLine1);
    printAndMove(addressLine2);
    printAndMove(addressLine3);

    y += 20;
    doc.fontSize(12).font('Helvetica');
    printAndMove(formattedStartDate);
    printAndMove(formattedTime);

    y += 20;
    doc.fontSize(12).fillColor('gray');
    printAndMove(liveLanguage);
    printAndMove(formattedCapacity);

    doc.fontSize(12).fillColor('darkorange').font('Helvetica-Bold');
    y = doc.page.height - 100;
    doc.text('We wish you a great time', 20, y, { continued: false });

    doc.end();
  });
};
