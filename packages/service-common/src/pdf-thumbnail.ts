import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function pdfThumbnail(pdf: Readonly<Buffer>): Promise<Buffer> {
  let data = null;

  // Determine the source of the PDF (Buffer or Uint8Array)
  if (Buffer.isBuffer(pdf)) {
    data = new Uint8Array(pdf);
  } else {
    throw new Error('Invalid PDF data, expected a Buffer');
  }

  const loadingTask = getDocument({
    data,
    disableFontFace: true,
    verbosity: 0,
  });

  const pdfDocument = await loadingTask.promise;

  const page = await pdfDocument.getPage(1);

  const viewport = page.getViewport({ scale: 1 });

  // @ts-expect-error
  const canvasAndContext = pdfDocument.canvasFactory.create(
    viewport.width,
    viewport.height,
  );

  const renderTask = page.render({
    canvasContext: canvasAndContext.context,
    viewport,
  });

  await renderTask.promise;

  return canvasAndContext.canvas.toBuffer('image/png');
}
