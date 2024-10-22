import { convert } from 'pdf-img-convert';

export async function createPngFromFirstPage(pdfBlob: Uint8Array | Buffer) {
  const pdfPages = await convert(pdfBlob);

  for (const page of pdfPages.values()) {
    if (page) {
      return page;
    }
  }

  return null;
}
