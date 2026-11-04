import { isRecord, assert, validatePostcardProject } from '../../domain/postcards/validation';
import type { PostcardProject } from '../../domain/postcards/types';
export { validatePostcardProject } from '../../domain/postcards/validation';

export function decodePostcardProject(raw: string): PostcardProject {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('Не удалось прочитать JSON проекта открыток. Исходные данные сохранены.'); }
  return validatePostcardProject(value);
}

/** Repair only omitted, unambiguous schema-v1 defaults; retain exact original first. */
export function repairPostcardProject(raw: string): PostcardProject {
  const value: unknown = JSON.parse(raw);
  assert(isRecord(value) && value.schemaVersion === 1 && value.product === 'postcards' && Array.isArray(value.postcards), 'Автоматически восстановить эту версию проекта открыток не удалось.');
  for (const card of value.postcards) {
    if (!isRecord(card) || !Array.isArray(card.elements)) continue;
    for (const element of card.elements) {
      if (!isRecord(element)) continue;
      element.rotation ??= 0;
      element.locked ??= false;
      if (element.type === 'text') {
        element.lineHeight ??= 1.2;
        element.letterSpacing ??= 0;
        element.stroke ??= null;
        element.shadow ??= null;
        element.weight ??= 'normal';
        element.italic ??= false;
      } else element.opacity ??= 1;
    }
  }
  value.activePostcardId ??= isRecord(value.postcards[0]) ? value.postcards[0].id : undefined;
  return validatePostcardProject(value);
}
