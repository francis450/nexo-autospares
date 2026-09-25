import { getFontEmbedCSS, toJpeg } from 'html-to-image';
import { POSTER_HEIGHT, POSTER_WIDTH } from '../components/SharePoster';

// Embedding web fonts means fetching every @font-face; do it once per page load.
let fontCssPromise: Promise<string> | null = null;

const waitForImages = (node: HTMLElement) =>
  Promise.all(
    Array.from(node.querySelectorAll('img')).map((img) =>
      img.complete ? img.decode().catch(() => undefined) : new Promise((resolve) => {
        img.onload = img.onerror = resolve;
      })
    )
  );

export async function renderPosterFile(node: HTMLElement, fileName: string): Promise<File> {
  await document.fonts.ready;
  await waitForImages(node);
  fontCssPromise ??= getFontEmbedCSS(node).catch(() => '');
  const fontEmbedCSS = await fontCssPromise;

  const options = {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    pixelRatio: 1,
    quality: 0.9,
    backgroundColor: '#0F1012',
    fontEmbedCSS,
  };
  // Safari sometimes paints images blank on the first pass; the second pass is reliable.
  await toJpeg(node, options);
  const dataUrl = await toJpeg(node, options);
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled';

export async function shareOrDownload(file: File, text: string): Promise<ShareResult> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // NotAllowedError etc. (e.g. user-gesture expired) — fall back to a download.
    }
  }
  downloadFile(file);
  return 'downloaded';
}
