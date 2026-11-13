import { jsPDF } from 'jspdf';
import { trackPdfDownload } from '../../analytics';
import { loadLocalResourceBytes, releaseLocalResourceBytes } from '../../infrastructure/resources';
import { t } from '../../i18n';
import { giftDisplayName, type SavedGiftItem } from './giftIdeas';

export async function downloadGiftPdf(items: readonly SavedGiftItem[]) {
  if (!items.length) return;
  const fontPath = 'fonts/PTSans-Regular.ttf';
  try {
    const bytes = await loadLocalResourceBytes(fontPath);
    let font = '';
    for (let i = 0; i < bytes.length; i += 8192) font += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    doc.addFileToVFS('PTSans-Regular.ttf', btoa(font));
    doc.addFont('PTSans-Regular.ttf', 'PTSans', 'normal');
    doc.setFont('PTSans', 'normal');
    doc.setProperties({ title: t('pages.giftIdeas.list.title'), author: t('common.brand') });
    const header = () => {
      doc.setTextColor('#315C4C'); doc.setFontSize(18);
      doc.text(t('pages.giftIdeas.list.title'), 20, 20);
      doc.setTextColor('#303A33'); doc.setFontSize(11);
      doc.text(t('pages.giftIdeas.pdf.count', { count: items.length }), 20, 28);
      doc.setFontSize(12);
    };
    header();
    let y = 40;
    for (const [index, item] of items.entries()) {
      const lines = doc.splitTextToSize(`${index + 1}. ${giftDisplayName(item)}`, 162) as string[];
      let first = true;
      for (const line of lines) {
        if (y + 6 > 277) { doc.addPage(); header(); y = 40; }
        // Draw the checkbox as a vector: it must not depend on font glyph coverage.
        if (first) { doc.setDrawColor('#53705A'); doc.setLineWidth(0.25); doc.rect(20, y - 3.5, 3.5, 3.5); first = false; }
        doc.text(line, 28, y);
        y += 6;
      }
      y += 3;
    }
    await trackPdfDownload('gift_list_export', () => doc.save('my-gift-list.pdf', { returnPromise: true }));
  } finally { releaseLocalResourceBytes(fontPath); }
}
