import { Readable } from 'node:stream';

import type { Dependencies } from '#src/dependencies.js';

// ConvertAPI configuration
const CONVERT_API_SECRET = process.env.CONVERT_API_SECRET;

/**
 * Convert a PPTX file to PNG images using ConvertAPI and upload them to S3
 * @param dependencies - Application dependencies including S3 client
 * @param s3KeyDir - S3 directory prefix ending with '/'
 * @param baseNameNoExt - Base filename without extension
 */
export const convertPptxToPngs = async (
  dependencies: Dependencies,
  s3KeyDir: string, // dir prefix ending with '/'
  baseNameNoExt: string,
) => {
  try {
    if (!CONVERT_API_SECRET) {
      console.warn(
        '[ConvertAPI] No API secret configured, skipping conversion',
      );
      return;
    }

    // Validate the secret before using it
    if (
      typeof CONVERT_API_SECRET !== 'string' ||
      CONVERT_API_SECRET.trim() === ''
    ) {
      console.error('[ConvertAPI] Invalid API secret format');
      return;
    }

    const pptxKey = `${s3KeyDir}${baseNameNoExt}.pptx`;

    // Retrieve the PPTX from S3
    const pptxBytes = await dependencies.s3.getBlob(pptxKey);
    if (!pptxBytes) {
      console.error('[ConvertAPI] PPTX not found for conversion:', pptxKey);
      return;
    }

    // Prepare multipart/form-data payload for ConvertAPI
    const form = new FormData();
    const blob = new Blob([pptxBytes], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    form.append('file', blob, `${baseNameNoExt}.pptx`);

    // Build the ConvertAPI URL with validation
    const apiUrl = `https://v2.convertapi.com/convert/pptx/to/png?Secret=${CONVERT_API_SECRET}`;

    // ConvertAPI endpoint for PPTX to PNG conversion
    const resp = await fetch(apiUrl, {
      method: 'POST',
      body: form as any,
    });

    const rawResp = await resp.text();

    let result: any;
    try {
      result = JSON.parse(rawResp);
    } catch {
      console.error(
        '[ConvertAPI] Non-JSON response from convert service:',
        rawResp.slice(0, 200),
      );
      return;
    }

    if (!result || !result.Files || !Array.isArray(result.Files)) {
      console.error('[ConvertAPI] Unexpected convert response', result);
      return;
    }

    // ConvertAPI returns individual PNG files, not a ZIP
    let slideIndex = 1;
    for (const file of result.Files) {
      // ConvertAPI returns FileData as base64, not URLs
      if (!file.FileData) {
        console.error('[ConvertAPI] No FileData for file:', file.FileName);
        continue;
      }

      // Decode base64 to buffer
      const imgBuf = Buffer.from(file.FileData, 'base64');

      const imgKey = `${s3KeyDir}${baseNameNoExt}_${slideIndex}.png`;

      await dependencies.s3.upload(imgKey, Readable.from(imgBuf), {
        contentType: 'image/png',
      });

      slideIndex += 1;
    }
  } catch (err) {
    console.error('[ConvertAPI] Conversion error', err);
  }
};
