import fs from 'node:fs';
import path from 'node:path';

import PDFDocument from 'pdfkit';
import qr from 'qr-image';

export const generateEventTicket = async ({
  title,
  addressLine1,
  addressLine2,
  addressLine3,
  formattedStartDate,
  formattedTime,
  liveLanguage,
  formattedCapacity,
  contact,
  userName,
}: {
  title?: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  formattedStartDate?: string;
  formattedTime?: string;
  liveLanguage: string | null;
  formattedCapacity?: string;
  contact: string | null;
  userName: string;
}) => {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument();
  let x = 0;
  let y = 0;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  doc.on('data', (chunk) => chunks.push(chunk));

  return new Promise<string>((resolve, reject) => {
    doc.on('end', () => {
      const result = Buffer.concat(chunks).toString('base64');
      resolve(result);
    });

    doc.on('error', reject);

    printStaticElements();
    printDescription();
    printContact();
    printTerms();
    printRightCard();

    doc.end();
  });

  function printStaticElements() {
    addImage('src/assets/pdf-header.png', 0, 0, 615);

    doc.fontSize(24).fillColor('#FF5C00').font('Helvetica-Bold');
    x = 130;
    y = doc.page.height - 110;
    doc.text('We wish you a great time !', x, y, { continued: false });
  }

  function printDescription() {
    x = 20;
    y = 180;

    doc.fontSize(20).fillColor('black').font('Helvetica-Bold');
    print(title);
    y += 60;

    doc.font('Helvetica').fontSize(12);
    doc.text('organised by ', x, y, {
      continued: true,
    });
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Plan B Network', {
      continued: false,
    });
    y += 30;

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

    y += 10;
    doc.strokeColor('lightgray');
    doc
      .moveTo(x, y)
      .lineTo(x + 200, y)
      .stroke();
  }

  function printContact() {
    y += 20;
    doc.fontSize(18).fillColor('black').font('Helvetica-Bold');
    if (contact) {
      printAndMove('Contact', 30);
    }

    doc.fontSize(16).font('Helvetica');
    x = 25;
    printAndMove(contact);
  }

  function printTerms() {
    x = 20;
    y += 20;
    doc.fontSize(18).font('Helvetica-Bold');
    printAndMove('Terms of use');

    y += 10;
    x = 30;
    doc.fontSize(11).font('Helvetica');
    printAndMove('To ensure your entry to the venue, please', 15);
    printAndMove('adhere to the following conditions:');

    printAndMove('• Your ticket is valid for a single entry and will be', 15);
    x = 36;
    printAndMove('electronically validated upon first check-in.', 15);
    x = 30;
    printAndMove('• Each e-Ticket allows access to the event for one', 15);
    x = 36;
    printAndMove('person only.', 15);
    x = 30;
    printAndMove('• It must not be duplicated or photocopied. Any', 15);
    x = 36;
    printAndMove('reproduction is fraudulent and unnecessary.', 15);
  }

  function printRightCard() {
    x = 420;
    y = 210;
    doc.fontSize(12).fillColor('black').font('Helvetica-Bold');
    doc.text('Name : ', x, y, {
      continued: true,
    });
    doc.font('Helvetica');
    doc.text(userName, {
      continued: false,
    });

    x -= 20;
    y += 10;
    // eslint-disable-next-line import/no-named-as-default-member
    const qrBuffer = qr.imageSync(`displayName:${userName}`);
    doc.image(qrBuffer, x, y, { width: 170 });
  }

  function print(content: string | null | undefined) {
    if (content) {
      doc.text(content, x, y);
    }
  }

  function printAndMove(content: string | null | undefined, moveY?: number) {
    if (content) {
      doc.text(content, x, y);
      y += moveY ? moveY : 18;
    }
  }

  function addImage(imagePath: string, x: number, y: number, w: number) {
    // TODO improve this
    if (process.env.NODE_ENV !== 'development') {
      imagePath = '/app/apps/api/' + imagePath;
    }
    const resolvedPath = path.resolve(imagePath);
    try {
      if (fs.existsSync(resolvedPath)) {
        doc.image(resolvedPath, x, y, { width: w });
      } else {
        console.warn(
          'Logo file not found at ' +
            resolvedPath +
            ', skipping logo insertion.',
        );
      }
    } catch (error) {
      console.error('Failed to add image at ' + resolvedPath + ':', error);
    }
  }
};
