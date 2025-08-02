import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import AdmZip from 'adm-zip';
import type formidable from 'formidable';
import type { Dependencies } from '#src/dependencies.js';
import { BadRequest } from '#src/errors.js';

// Constants
export const TRANSLATION_UPLOAD_CONSTANTS = {
  MAX_RETRIES: 6,
  RETRY_DELAY_MS: 3000,
  SUPPORTED_FILE_EXTENSIONS: {
    PPTX: '.pptx',
    TXT: '.txt',
    ZIP: '.zip',
  },
  MIME_TYPES: {
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    TEXT: 'text/plain',
    ZIP: 'application/zip',
  },
} as const;

// Types
export interface UploadFormData {
  courseId: string;
  languages: string[];
  files: formidable.File[];
  useEnglish?: boolean;
}

export interface ChapterGroup {
  pptx?: formidable.File;
  txts: formidable.File[];
}

export interface S3Keys {
  translatedPptKey: string | null;
  translatedTextKey: string | null;
  originalTextKey: string | null;
}

// URL validation utilities
export const validateUrl = (
  urlString: string,
): { hostname: string; protocol: string } => {
  try {
    const parsed = new URL(urlString);
    return { hostname: parsed.hostname, protocol: parsed.protocol };
  } catch {
    throw new BadRequest('Invalid URL provided');
  }
};

export const isUrlAllowed = (
  hostname: string,
  protocol: string,
  allowedHosts: string[],
): boolean => {
  if (protocol !== 'https:') {
    throw new BadRequest('Only HTTPS URLs are allowed');
  }

  return allowedHosts.some(
    (allowedHost) =>
      hostname === allowedHost || hostname.endsWith(`.${allowedHost}`),
  );
};

// File processing utilities
export const mimeFromName = (name: string): string =>
  name
    .toLowerCase()
    .endsWith(TRANSLATION_UPLOAD_CONSTANTS.SUPPORTED_FILE_EXTENSIONS.PPTX)
    ? TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.PPTX
    : TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.TEXT;

export const downloadRemoteFile = async (
  url: string,
  allowedHosts: string[],
): Promise<formidable.File> => {
  const { hostname, protocol } = validateUrl(url);

  if (!isUrlAllowed(hostname, protocol, allowedHosts)) {
    throw new BadRequest('URL host is not allowed');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remote-'));
  const tempZipPath = path.join(tempDir, 'download.zip');
  const arrayBuf = await response.arrayBuffer();
  fs.writeFileSync(tempZipPath, Buffer.from(arrayBuf));

  return {
    filepath: tempZipPath,
    originalFilename: 'download.zip',
    mimetype: TRANSLATION_UPLOAD_CONSTANTS.MIME_TYPES.ZIP,
  } as formidable.File;
};

export const processZipFiles = async (
  fileList: formidable.File[],
): Promise<formidable.File[]> => {
  const zipFiles = fileList.filter((f) =>
    f.originalFilename
      ?.toLowerCase()
      .endsWith(TRANSLATION_UPLOAD_CONSTANTS.SUPPORTED_FILE_EXTENSIONS.ZIP),
  );

  const extractedFiles: formidable.File[] = [];

  for (const zipFile of zipFiles) {
    try {
      const zip = new AdmZip(zipFile.filepath);
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-'));

      for (const entry of zip.getEntries()) {
        if (entry.isDirectory) continue;

        const entryPath = path.resolve(tempDir, entry.entryName);
        // Validate that the resolved path is within the tempDir
        if (!entryPath.startsWith(tempDir)) {
          console.warn(`Skipping potentially unsafe entry: ${entry.entryName}`);
          continue;
        }

        fs.mkdirSync(path.dirname(entryPath), { recursive: true });
        fs.writeFileSync(entryPath, entry.getData());

        extractedFiles.push({
          filepath: entryPath,
          originalFilename: entry.entryName,
          mimetype: mimeFromName(entry.entryName),
        } as formidable.File);
      }
    } catch (e) {
      console.error('Failed to extract zip', e);
    }
  }

  // Return non-zip files plus extracted files
  return [
    ...fileList.filter(
      (f) =>
        !f.originalFilename
          ?.toLowerCase()
          .endsWith(TRANSLATION_UPLOAD_CONSTANTS.SUPPORTED_FILE_EXTENSIONS.ZIP),
    ),
    ...extractedFiles,
  ];
};

// Slide processing utilities
export const buildS3Keys = (
  courseId: string,
  langKey: string,
  partId: string,
  chapterId: string,
  slideId: string,
  originalLanguage: string,
  pptxFile?: string,
  textFile?: string,
): S3Keys => ({
  translatedPptKey: pptxFile
    ? `contribute/${courseId}/${langKey}/${partId}/${chapterId}/${slideId}/pptx/${pptxFile}`
    : null,
  translatedTextKey: textFile
    ? `contribute/${courseId}/${langKey}/${partId}/${chapterId}/${slideId}/text/${textFile}`
    : null,
  originalTextKey: textFile
    ? `contribute/${courseId}/${originalLanguage}/${partId}/${chapterId}/text/${textFile}`
    : null,
});

export const safeGetBlob = async (
  dependencies: Dependencies,
  key: string | null,
): Promise<Uint8Array | null> => {
  if (!key) return null;
  try {
    return await dependencies.s3.getBlob(key);
  } catch (err: any) {
    if (err?.name === 'NoSuchKey') {
      return null;
    }
    console.error('[S3] Error fetching key', key, err);
    return null;
  }
};

export const fetchWithRetries = async (
  dependencies: Dependencies,
  originalKey: string,
  translatedKey: string,
): Promise<{ origBlob: Uint8Array | null; transBlob: Uint8Array | null }> => {
  let [origBlob, transBlob] = await Promise.all([
    safeGetBlob(dependencies, originalKey),
    safeGetBlob(dependencies, translatedKey),
  ]);

  let attempt = 0;
  while (
    (!origBlob || !transBlob) &&
    attempt < TRANSLATION_UPLOAD_CONSTANTS.MAX_RETRIES
  ) {
    attempt += 1;
    await new Promise((r) =>
      setTimeout(r, TRANSLATION_UPLOAD_CONSTANTS.RETRY_DELAY_MS),
    );
    if (!origBlob) origBlob = await safeGetBlob(dependencies, originalKey);
    if (!transBlob) transBlob = await safeGetBlob(dependencies, translatedKey);
  }

  return { origBlob, transBlob };
};

export const extractSlideNumber = (textFile: string): number => {
  try {
    const match = /_(\d+)(?=\.[^.]+$)/.exec(textFile);
    return match ? Number(match[1]) : 0;
  } catch {
    return 0;
  }
};

export const extractProfessorName = (textFile: string): string | null => {
  const baseTxtName = path.basename(textFile);
  const nameSegments = baseTxtName.split('_');
  return nameSegments.length >= 3 ? nameSegments[1] : null;
};

export const logMissingSlideContent = (
  courseId: string,
  langKey: string,
  partId: string,
  chapterId: string,
  slideId: string,
  originalKey: string,
  translatedKey: string,
  translatedPptKey: string | null,
  origBlob: Uint8Array | null,
  transBlob: Uint8Array | null,
  attempts: number,
): void => {
  console.warn('[UPLOAD] Missing slide content after retries', {
    courseId,
    lang: langKey,
    partId,
    chapterId,
    slideId,
    originalKey,
    translatedKey,
    pptKey: translatedPptKey,
    missingOriginal: !origBlob,
    missingTranslated: !transBlob,
    attempts,
  });
};

export const blobToString = (blob: Uint8Array | null): string | null =>
  blob ? Buffer.from(blob).toString('utf-8') : null;

// Chapter organization utilities
export const parseChapterKey = (
  relativePath: string,
): { partIndex: number; chapterIndex: number } | null => {
  const pathSeparator = /[\\/]/;
  const segments = relativePath.split(pathSeparator);

  let partIndex: number | null = null;
  let chapterIndex: number | null = null;

  // Try to find a directory segment like "1.2"
  const partChapSegment = segments.find((s: string) => /^\d+\.\d+$/.test(s));
  if (partChapSegment) {
    const match = /^(\d+)\.(\d+)$/.exec(partChapSegment);
    if (match) {
      partIndex = Number(match[1]);
      chapterIndex = Number(match[2]);
    }
  }

  // Fallback: look at the filename itself (before first underscore or dot)
  if (partIndex === null || chapterIndex === null) {
    const baseName = segments[segments.length - 1]; // e.g. 1.2_0.txt
    const match = /^(\d+)\.(\d+)/.exec(baseName);
    if (match) {
      partIndex = Number(match[1]);
      chapterIndex = Number(match[2]);
    }
  }

  if (partIndex === null || chapterIndex === null) {
    return null;
  }

  return { partIndex, chapterIndex };
};

export const categorizeFile = (
  file: formidable.File,
): 'pptx' | 'txt' | 'unknown' => {
  if (
    file.mimetype?.includes('presentation') ||
    file.originalFilename?.endsWith(
      TRANSLATION_UPLOAD_CONSTANTS.SUPPORTED_FILE_EXTENSIONS.PPTX,
    )
  ) {
    return 'pptx';
  }

  if (
    file.mimetype?.startsWith('text') ||
    file.originalFilename?.endsWith(
      TRANSLATION_UPLOAD_CONSTANTS.SUPPORTED_FILE_EXTENSIONS.TXT,
    )
  ) {
    return 'txt';
  }

  return 'unknown';
};

export const buildS3Key = (
  type: 'pptx' | 'text',
  courseId: string,
  originalLanguage: string,
  partId: string,
  chapterId: string,
  filename: string,
): string =>
  `contribute/${courseId}/${originalLanguage}/${partId}/${chapterId}/${type}/${filename}`;
