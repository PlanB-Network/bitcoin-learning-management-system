import { convert } from 'pdf-img-convert';

import { type TransactionSql, firstRow } from '@blms/database';
import type { S3Service } from '@blms/s3';
import type { ChangedFile, UserAccount } from '@blms/types';

import { yamlToObject } from '../../utils.js';

interface BCertificateResult {
  username: string;
  categories: {
    [key: string]: number;
  };
}

export const createProcessResultFile = (transaction: TransactionSql) => {
  return async (bcertId: string, file: ChangedFile) => {
    const parsed = yamlToObject<BCertificateResult>(file.data);

    const uid = await transaction<Array<Pick<UserAccount, 'uid'>>>`
          SELECT uid FROM users.accounts WHERE username = LOWER( ${parsed.username} )
        `
      .then(firstRow)
      .then((row) => row?.uid);

    if (!uid) {
      throw new Error(`uid not found for username ${parsed.username}`);
    }

    const categories = parsed.categories;

    for (const category of Object.keys(categories)) {
      await transaction`
          INSERT INTO users.b_certificate_results (
            uid, b_certificate_exam, category, score, last_updated, last_commit, last_sync
          )
          VALUES (
            ${uid},
            ${bcertId},
            ${category},
            ${categories[category]},
            ${file.time},
            ${file.commit},
            NOW()
          )
          ON CONFLICT (uid, b_certificate_exam, category) DO UPDATE SET
            score = EXCLUDED.score,
            last_updated = EXCLUDED.last_updated,
            last_commit = EXCLUDED.last_commit,
            last_sync = NOW()
        `;
    }
  };
};

export const createProcessTimestampFile = (
  transaction: TransactionSql,
  s3: S3Service,
) => {
  return async (file: ChangedFile, bcertEdition: string, bcertId: string) => {
    const fileBuffer = file.data;

    // file.path => results/03f15fce2e/bitcoin_certificate-signed.pdf
    const userName = file.path.split('/').slice(1, 2).join('/');
    const fileName = file.path.split('/').slice(2, 3).join('/');
    const filePath = `bcertresults/${bcertEdition}/${userName}/${fileName}`;
    const filePathWithoutExtension = filePath.split('.').slice(0, 1).join('');

    const uid = await transaction<Array<Pick<UserAccount, 'uid'>>>`
      SELECT uid FROM users.accounts WHERE username = LOWER( ${userName} )
    `
      .then(firstRow)
      .then((row) => row?.uid);

    if (!uid) {
      return;
      //throw new Error(`uid not found for username ${userName}`);
    }

    const fileType = file.path.split('.').slice(-1).join('.');

    let mimeType = '';
    switch (fileType) {
      case 'pdf': {
        mimeType = 'application/pdf';
        break;
      }
      case 'txt': {
        mimeType = 'text/plain';
        break;
      }
      case 'ots': {
        mimeType = 'application/octet-stream';
        break;
      }
      default: {
        mimeType = 'application/octet-stream';
      }
    }

    await s3.put(filePath, fileBuffer, mimeType);
    console.log('put on s3', filePath);

    if (fileType === 'pdf') {
      const thumbnail = await createPngFromFirstPage(fileBuffer);
      if (!thumbnail) {
        console.warn('No thumbnail found for', filePath);
        return null;
      }
      await s3.put(`${filePathWithoutExtension}.png`, thumbnail, 'image/png');
    }

    await transaction`
    INSERT INTO users.b_certificate_timestamps (
      uid, b_certificate_exam, pdf_key, img_key, txt_key, txt_ots_key, last_sync
    )
    VALUES (
      ${uid},
      ${bcertId},
      ${filePathWithoutExtension + '.pdf'},
      ${filePathWithoutExtension + '.png'},
      ${filePathWithoutExtension + '.txt'},
      ${filePathWithoutExtension + '.txt.ots'},
      NOW()
    )
    ON CONFLICT (uid, b_certificate_exam) DO UPDATE SET
      pdf_key = EXCLUDED.pdf_key,
      img_key = EXCLUDED.img_key,
      txt_key = EXCLUDED.txt_key,
      txt_ots_key = EXCLUDED.txt_ots_key,
      last_sync = NOW()
  `;
  };
};

export async function createPngFromFirstPage(pdfBlob: Uint8Array | Buffer) {
  const pdfPages = await convert(pdfBlob);

  for (const page of pdfPages.values()) {
    if (page) {
      return page;
    }
  }

  return null;
}
