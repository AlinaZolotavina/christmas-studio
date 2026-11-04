import type { OperationResult } from '../commands';
import type { Postcard, PostcardBackground, PostcardElement, PostcardElementPatch, PostcardFormat, PostcardProject, PostcardTemplate } from './types';
import { MAX_POSTCARDS, MAX_POSTCARD_ELEMENTS } from './types';
import { clonePostcard, clonePostcardElement, createPostcard, snapPostcardRotation } from './project';
import { assert, validatePostcardElement, validatePostcardProject } from './validation';

interface CardTarget { postcardId: string }
interface ElementTarget extends CardTarget { elementId: string }
export type PostcardCommand =
  | { type: 'rename-project'; name: string }
  | { type: 'set-default-format'; format: PostcardFormat }
  | { type: 'add-postcard'; format?: PostcardFormat; template?: PostcardTemplate; afterId?: string }
  | ({ type: 'duplicate-postcard' } & CardTarget)
  | ({ type: 'remove-postcard' } & CardTarget)
  | ({ type: 'reorder-postcard'; index: number } & CardTarget)
  | ({ type: 'set-format'; format: PostcardFormat } & CardTarget)
  | ({ type: 'apply-template'; template: PostcardTemplate; format?: PostcardFormat } & CardTarget)
  | ({ type: 'update-background'; background: PostcardBackground } & CardTarget)
  | ({ type: 'add-element'; element: PostcardElement } & CardTarget)
  | ({ type: 'update-element'; patch: PostcardElementPatch } & ElementTarget)
  | ({ type: 'remove-element' } & ElementTarget)
  | ({ type: 'duplicate-element' } & ElementTarget)
  | ({ type: 'set-element-lock'; locked: boolean } & ElementTarget)
  | ({ type: 'reorder-element'; index: number } & ElementTarget);
export interface PostcardCommandOutcome { project: PostcardProject; result: OperationResult }
const emptyResult = (): OperationResult => ({ changed: false, changedCardIds: [], warnings: [], skippedCardIds: [] });
const commonKeys = ['x', 'y', 'width', 'height', 'rotation'];
const allowedKeys: Record<PostcardElement['type'], string[]> = {
  text: [...commonKeys, 'content', 'fontId', 'fontSize', 'weight', 'italic', 'color', 'align', 'lineHeight', 'letterSpacing', 'stroke', 'shadow'],
  image: [...commonKeys, 'assetId', 'opacity'],
  lettering: [...commonKeys, 'assetId', 'opacity'],
  decoration: [...commonKeys, 'shape', 'assetId', 'fill', 'stroke', 'strokeWidth', 'points', 'opacity'],
};
function move<T>(items: T[], from: number, index: number) {
  assert(Number.isInteger(index) && index >= 0 && index < items.length, 'Некорректная позиция в порядке.');
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(index, 0, item);
  return next;
}
function updateElement(element: PostcardElement, patch: PostcardElementPatch): PostcardElement {
  assert(!element.locked, 'Сначала разблокируйте элемент во вкладке «Слои».');
  assert(Object.keys(patch).every(key => allowedKeys[element.type].includes(key)), 'Свойство не поддерживается этим типом элемента.');
  const normalized = structuredClone(patch);
  if (normalized.rotation !== undefined) normalized.rotation = snapPostcardRotation(normalized.rotation);
  if (element.type !== 'text') {
    const ratio = element.width / element.height;
    if (normalized.width !== undefined && normalized.height === undefined) normalized.height = normalized.width / ratio;
    else if (normalized.height !== undefined && normalized.width === undefined) normalized.width = normalized.height * ratio;
    else if (normalized.width !== undefined && normalized.height !== undefined) assert(Math.abs(normalized.width / normalized.height - ratio) <= 0.000001 * Math.max(1, ratio), 'Графические элементы масштабируются с сохранением пропорций.');
  }
  return validatePostcardElement({ ...element, ...normalized });
}

/** Immutable, atomic command transaction. Unaffected postcards retain their references. */
export function executePostcardCommand(project: PostcardProject, command: PostcardCommand): PostcardCommandOutcome {
  const result = emptyResult();
  try {
    const next: PostcardProject = { ...project, postcards: [...project.postcards] };
    if (command.type === 'rename-project') next.name = command.name;
    else if (command.type === 'set-default-format') next.defaultFormat = command.format;
    else if (command.type === 'add-postcard') {
      assert(next.postcards.length < MAX_POSTCARDS, `В проекте может быть не более ${MAX_POSTCARDS} открыток.`);
      const card = createPostcard(command.format ?? command.template?.format ?? project.defaultFormat, command.template);
      const after = command.afterId ? next.postcards.findIndex(item => item.id === command.afterId) : next.postcards.length - 1;
      assert(after >= 0, 'Открытка для добавления не найдена.');
      next.postcards.splice(after + 1, 0, card);
      next.activePostcardId = card.id;
    } else {
      const cardIndex = next.postcards.findIndex(card => card.id === command.postcardId);
      assert(cardIndex >= 0, 'Открытка не найдена.');
      const original = next.postcards[cardIndex];
      if (command.type === 'duplicate-postcard') {
        assert(next.postcards.length < MAX_POSTCARDS, `В проекте может быть не более ${MAX_POSTCARDS} открыток.`);
        const copy = clonePostcard(original);
        next.postcards.splice(cardIndex + 1, 0, copy);
        next.activePostcardId = copy.id;
      } else if (command.type === 'remove-postcard') {
        assert(next.postcards.length > 1, 'Нельзя удалить последнюю открытку проекта.');
        next.postcards.splice(cardIndex, 1);
        if (next.activePostcardId === original.id) next.activePostcardId = next.postcards[Math.min(cardIndex, next.postcards.length - 1)].id;
      } else if (command.type === 'reorder-postcard') next.postcards = move(next.postcards, cardIndex, command.index);
      else {
        let card: Postcard = { ...original, elements: [...original.elements] };
        if (command.type === 'set-format') card.format = command.format;
        else if (command.type === 'apply-template') card = { ...createPostcard(command.format ?? card.format, command.template), id: original.id };
        else if (command.type === 'update-background') card.background = structuredClone(command.background);
        else if (command.type === 'add-element') {
          assert(card.elements.length < MAX_POSTCARD_ELEMENTS, `На открытке может быть не более ${MAX_POSTCARD_ELEMENTS} элементов.`);
          card.elements.push(structuredClone(command.element));
        } else {
          const elementIndex = card.elements.findIndex(element => element.id === command.elementId);
          assert(elementIndex >= 0, 'Элемент не найден на открытке.');
          const element = card.elements[elementIndex];
          if (command.type === 'update-element') card.elements[elementIndex] = updateElement(element, command.patch);
          else if (command.type === 'set-element-lock') card.elements[elementIndex] = { ...element, locked: command.locked };
          else if (command.type === 'remove-element') {
            assert(!element.locked, 'Сначала разблокируйте элемент во вкладке «Слои».');
            card.elements.splice(elementIndex, 1);
          } else if (command.type === 'duplicate-element') {
            assert(card.elements.length < MAX_POSTCARD_ELEMENTS, `На открытке может быть не более ${MAX_POSTCARD_ELEMENTS} элементов.`);
            const copy = clonePostcardElement(element);
            copy.x += 2; copy.y += 2;
            card.elements.splice(elementIndex + 1, 0, copy);
          } else if (command.type === 'reorder-element') card.elements = move(card.elements, elementIndex, command.index);
        }
        next.postcards[cardIndex] = card;
      }
    }
    validatePostcardProject(next);
    result.changed = JSON.stringify(next) !== JSON.stringify(project);
    if (!result.changed) return { project, result };
    const before = new Map(project.postcards.map(card => [card.id, card]));
    result.changedCardIds = next.postcards.filter((card, index) => before.get(card.id) !== card || project.postcards[index]?.id !== card.id).map(card => card.id);
    for (const card of project.postcards) if (!next.postcards.some(item => item.id === card.id)) result.changedCardIds.push(card.id);
    return { project: next, result };
  } catch (error) {
    return { project, result: { ...emptyResult(), error: error instanceof Error ? error.message : 'Не удалось выполнить действие с открыткой.' } };
  }
}
