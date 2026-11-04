import { getPostcardResource } from '../../content/postcard-assets';
import { getPostcardSize, type Postcard, type PostcardElement, type PostcardProject } from '../../domain/postcards/types';
import { createPostcardScene, type PostcardSceneOptions } from '../../rendering/scene';
import { getPostcardFontState, getPostcardMissingGlyphs } from '../../rendering/postcard-fonts';
import type { PostcardExportScope } from './postcardLayout';

export interface PostcardValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  postcardId?: string;
  elementId?: string;
  pageIndex?: number;
}
export interface PostcardValidationOptions extends PostcardSceneOptions { scope?: PostcardExportScope; preflight?: boolean }

function validatePostcards(cards: Postcard[], options: PostcardValidationOptions): PostcardValidationIssue[] {
  const issues: PostcardValidationIssue[] = [];
  for (const postcard of cards) {
    const { width, height } = getPostcardSize(postcard);
    const issue = (code: string, severity: PostcardValidationIssue['severity'], message: string, element?: PostcardElement) => issues.push({ code, severity, message, postcardId: postcard.id, elementId: element?.id });
    if (postcard.background.kind === 'image') {
      const resource = getPostcardResource('background', postcard.background.assetId);
      if (!resource) issue('missing-background', 'error', 'Фоновое изображение недоступно. Выберите другой фон.');
      else if (options.preflight && resource.format !== 'svg') {
        // Cover crops the source at its largest scale; cropped pixels do not increase DPI.
        const dpi = 25.4 / Math.max(width / resource.width, height / resource.height);
        if (dpi < 299.5) issue('background-resolution', 'warning', `Разрешение фона около ${Math.round(dpi)} DPI. Для чёткой печати рекомендуется 300 DPI.`);
      }
    }
    const scene = createPostcardScene(postcard, options);
    for (const node of scene.nodes) {
      const element = node.element;
      const bounds = node.bounds;
      const outside = bounds.x < -0.001 || bounds.y < -0.001 || bounds.x + bounds.width > width + 0.001 || bounds.y + bounds.height > height + 0.001;
      if (outside) issue('element-outside-postcard', 'error', 'Элемент выходит за границы открытки. Переместите или уменьшите его.', element);
      else if (options.preflight && (bounds.x < 3 || bounds.y < 3 || bounds.x + bounds.width > width - 3 || bounds.y + bounds.height > height - 3)) issue('safe-margin', 'warning', 'Элемент расположен ближе 3 мм к краю открытки и может пострадать при обрезке.', element);
      if (node.type === 'text') {
        if (node.layout.overflow) issue('text-overflow', 'error', 'Текст не помещается в блок. Измените размер блока или размер шрифта.', element);
        const original = postcard.elements.find(item => item.id === node.id);
        const state = getPostcardFontState(original?.type === 'text' ? original : node.element);
        if (state.status === 'error') issue('missing-font', 'error', state.message ?? 'Шрифт недоступен.', element);
        else if (state.message) issue('font-replaced', 'warning', state.message, element);
        const missing = getPostcardMissingGlyphs(node.element);
        if (missing.length) issue('missing-glyph', 'error', `Шрифт не содержит символы: ${missing.slice(0, 8).join(' ')}. Выберите другой шрифт или измените текст.`, element);
      } else if (element.type !== 'text') {
        const resource = element.type === 'decoration' ? element.assetId && getPostcardResource('decoration', element.assetId) : getPostcardResource(element.type, element.assetId);
        if (element.type === 'decoration' && !element.assetId) continue;
        if (!resource) { issue('missing-resource', 'error', 'Графический ресурс недоступен. Выберите другой из библиотеки.', element); continue; }
        if (options.preflight && resource.format !== 'svg') {
          const dpi = 25.4 / Math.min(element.width / resource.width, element.height / resource.height);
          if (dpi < 299.5) issue('image-resolution', 'warning', `Разрешение изображения около ${Math.round(dpi)} DPI в выбранном размере. Для чёткой печати рекомендуется 300 DPI.`, element);
        }
      }
    }
  }
  return issues;
}

export function validatePostcard(postcard: Postcard, options: PostcardValidationOptions = {}): PostcardValidationIssue[] {
  return validatePostcards([postcard], options);
}

export function validatePostcardProject(project: PostcardProject, options: PostcardValidationOptions = {}): PostcardValidationIssue[] {
  return validatePostcards(options.scope === 'current' ? project.postcards.filter(card => card.id === project.activePostcardId) : project.postcards, options);
}
