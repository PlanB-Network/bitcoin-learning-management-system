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

/**
 * Convert PPTX to PNG for slide translations - uses the exact PPTX path from database
 * @param dependencies - Application dependencies including S3 client
 * @param s3KeyDir - S3 directory prefix ending with '/' for PNG output
 * @param baseNameNoExt - Base filename without extension for PNG naming
 * @param pptxPath - Full S3 path to the PPTX file (should be proofread version)
 */
export const convertSlideToProofreadPngs = async (
  dependencies: Dependencies,
  s3KeyDir: string,
  baseNameNoExt: string,
  pptxPath: string,
) => {
  try {
    console.log('[ConvertAPI] Starting PNG conversion for slide translation');
    console.log('[ConvertAPI] s3KeyDir:', s3KeyDir);
    console.log('[ConvertAPI] baseNameNoExt:', baseNameNoExt);
    console.log('[ConvertAPI] pptxPath:', pptxPath);

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

    // Use the proofread version of the PPTX
    const proofreadPptxPath = pptxPath.replace('.pptx', '-proofread.pptx');
    console.log(
      '[ConvertAPI] Looking for proofread PPTX at:',
      proofreadPptxPath,
    );

    // Retrieve the PPTX from S3
    const pptxBytes = await dependencies.s3.getBlob(proofreadPptxPath);
    if (!pptxBytes) {
      console.error(
        '[ConvertAPI] Proofread PPTX not found for conversion:',
        proofreadPptxPath,
      );
      return;
    }

    console.log(
      '[ConvertAPI] Found proofread PPTX file, size:',
      pptxBytes.byteLength,
      'bytes',
    );

    // Prepare multipart/form-data payload for ConvertAPI
    const form = new FormData();
    const blob = new Blob([pptxBytes], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    form.append('file', blob, `${baseNameNoExt}.pptx`);

    // Build the ConvertAPI URL with validation
    const apiUrl = `https://v2.convertapi.com/convert/pptx/to/png?Secret=${CONVERT_API_SECRET}`;

    // ConvertAPI endpoint for PPTX to PNG conversion
    console.log('[ConvertAPI] Calling ConvertAPI...');
    const resp = await fetch(apiUrl, {
      method: 'POST',
      body: form as any,
    });

    console.log('[ConvertAPI] Response status:', resp.status);
    const rawResp = await resp.text();
    console.log('[ConvertAPI] Raw response length:', rawResp.length);

    let result: any;
    try {
      result = JSON.parse(rawResp);
      console.log(
        '[ConvertAPI] Parsed response:',
        JSON.stringify(result, null, 2),
      );
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

    console.log('[ConvertAPI] Found', result.Files.length, 'files to process');

    // ConvertAPI returns individual PNG files, not a ZIP
    let slideIndex = 1;
    for (const file of result.Files) {
      console.log('[ConvertAPI] Processing file:', file.FileName);

      // ConvertAPI returns FileData as base64, not URLs
      if (!file.FileData) {
        console.error('[ConvertAPI] No FileData for file:', file.FileName);
        continue;
      }

      // Decode base64 to buffer
      const imgBuf = Buffer.from(file.FileData, 'base64');
      console.log(
        '[ConvertAPI] Decoded image buffer size:',
        imgBuf.length,
        'bytes',
      );

      const imgKey = `${s3KeyDir}png/${baseNameNoExt}_${slideIndex}.png`;
      console.log('[ConvertAPI] Uploading to S3 key:', imgKey);

      await dependencies.s3.upload(imgKey, Readable.from(imgBuf), {
        contentType: 'image/png',
      });

      console.log('[ConvertAPI] Successfully uploaded:', imgKey);
      slideIndex += 1;
    }

    console.log('[ConvertAPI] PNG conversion process completed successfully');
  } catch (err) {
    console.error('[ConvertAPI] Conversion error', err);
    throw err;
  }
};
