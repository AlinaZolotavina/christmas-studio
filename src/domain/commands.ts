import type { Background, Card, Decoration, Hole, Illustration, ProjectDocument, Scope, Shape, TextElement } from './types';
import { MAX_DECORATIONS, MAX_TEXT_LENGTH } from './types';
import { makeId } from './project';
import { defaultHole, isHoleInside } from './geometry';
import { assets } from '../content/assets';

const knownAssetIds = new Set(assets.map(asset => asset.id));

interface Target { cardId: string; scope?: Scope }
type DecorationStyle = Pick<Decoration, 'fill' | 'stroke' | 'strokeWidth' | 'points'>;
export type Command =
  | ({ type: 'update-text'; patch: Partial<TextElement> } & Target)
  | ({ type: 'update-illustration'; patch: Partial<Illustration> } & Target)
  | ({ type: 'update-background'; patch: Partial<Background> } & Target)
  | ({ type: 'resize-card'; patch: { width?: number; height?: number; shape?: Shape } } & Target)
  | ({ type: 'add-decoration'; patch: Partial<Omit<Decoration, 'id'>> & Pick<Decoration, 'type'> } & Target)
  | { type: 'update-decoration'; cardId: string; decorationId: string; patch: Partial<Omit<Decoration, 'id' | 'type'>> }
  | { type: 'remove-decoration'; cardId: string; decorationId: string }
  | ({ type: 'remove-decoration-type'; decorationType: Decoration['type'] } & Target)
  | ({ type: 'apply-decoration-type'; decorationType: Decoration['type']; patch: Partial<DecorationStyle> } & Target)
  | ({ type: 'set-hole'; enabled: boolean } & Target)
  | { type: 'move-hole'; cardId: string; patch: Hole }
  | { type: 'set-project-hole'; enabled: boolean }
  | { type: 'rename-project'; name: string };

export interface OperationResult {
  changed: boolean;
  changedCardIds: string[];
  warnings: string[];
  skippedCardIds: string[];
  error?: string;
}
export interface CommandOutcome { project: ProjectDocument; result: OperationResult }
const emptyResult = (): OperationResult => ({ changed: false, changedCardIds: [], warnings: [], skippedCardIds: [] });

function validNumber(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }
function positive(value: unknown): value is number { return validNumber(value) && value > 0; }
function validColor(value: unknown): value is string { return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value); }
function assertBox(box: { x: number; y: number; width: number; height: number }) {
  if (!validNumber(box.x) || !validNumber(box.y) || !positive(box.width) || !positive(box.height)) throw new Error('Положение и размеры элемента должны быть конечными числами; размеры — больше нуля.');
}
function assertDecoration(decoration: Decoration) {
  assertBox(decoration);
  if (decoration.width > 20 || decoration.height > 20) throw new Error('Размер декорации не может превышать 2 см.');
  if (!['circle', 'star'].includes(decoration.type) || !Number.isInteger(decoration.points) || decoration.points < 4 || decoration.points > 8) throw new Error('У звезды должно быть от 4 до 8 лучей.');
  if ((decoration.fill !== null && !validColor(decoration.fill)) || (decoration.stroke !== null && !validColor(decoration.stroke))) throw new Error('Некорректный цвет декорации.');
  if (!validNumber(decoration.strokeWidth) || decoration.strokeWidth < 0.25 || decoration.strokeWidth > 3) throw new Error('Толщина обводки должна быть от 0,25 до 3 pt.');
}

/** Pure command executor. A rejected operation never exposes its intermediate mutations. */
export function executeCommand(project: ProjectDocument, command: Command): CommandOutcome {
  const result = emptyResult();
  try {
    const next = structuredClone(project);
    if (command.type === 'rename-project') {
      if (typeof command.name !== 'string' || command.name.trim().length === 0 || command.name.length > 120) throw new Error('Название должно содержать от 1 до 120 символов.');
      next.name = command.name;
    } else if (command.type === 'set-project-hole') {
      next.holeEnabled = command.enabled;
      for (const card of next.cards) card.hole = command.enabled ? card.hole ?? createHole(card) : null;
    } else {
      const source = next.cards.find(card => card.id === command.cardId);
      if (!source) throw new Error('Карточка не найдена.');
      const scope = 'scope' in command ? command.scope ?? 'current' : 'current';
      const targets = scope === 'all' ? next.cards : [source];
      for (const card of targets) {
        switch (command.type) {
          case 'update-text': {
            const patch = { ...command.patch };
            if (scope === 'all') { delete patch.content; delete patch.x; delete patch.y; }
            card.text = { ...card.text, ...patch };
            assertBox(card.text);
            const text = card.text;
            if (typeof text.content !== 'string' || text.content.length > MAX_TEXT_LENGTH) throw new Error(`Текст может содержать не более ${MAX_TEXT_LENGTH} символов.`);
            if (!validNumber(text.fontSize) || text.fontSize < 6 || text.fontSize > 72) throw new Error('Размер шрифта должен быть от 6 до 72 pt.');
            if (!['sans', 'serif', 'script'].includes(text.fontId) || !['normal', 'bold'].includes(text.weight) || typeof text.italic !== 'boolean' || !['left', 'center', 'right'].includes(text.align) || !validColor(text.color)) throw new Error('Некорректное оформление текста.');
            break;
          }
          case 'update-illustration':
            card.illustration = { ...card.illustration, ...command.patch };
            assertBox(card.illustration);
            if (!validNumber(card.illustration.rotation)) throw new Error('Некорректный угол иллюстрации.');
            if (!knownAssetIds.has(card.illustration.assetId)) throw new Error('Иллюстрация не найдена в библиотеке.');
            break;
          case 'update-background': {
            card.background = { ...card.background, ...command.patch, colors: [...(command.patch.colors ?? card.background.colors)] };
            const background = card.background;
            if (!['solid', 'linear', 'radial'].includes(background.kind) || !Array.isArray(background.colors) || background.colors.length < 1 || background.colors.length > 3 || !background.colors.every(validColor) || !validNumber(background.angle) || !validNumber(background.centerX) || !validNumber(background.centerY) || background.centerX < 0 || background.centerX > 1 || background.centerY < 0 || background.centerY > 1) throw new Error('Некорректные настройки фона.');
            break;
          }
          case 'resize-card': resizeCard(card, command.patch); break;
          case 'add-decoration': {
            if (card.decorations.length >= MAX_DECORATIONS) { result.skippedCardIds.push(card.id); break; }
            const patch = command.patch;
            const decoration: Decoration = { id: makeId(), x: 5, y: 5, width: 10, height: 10, fill: '#C2A26B', stroke: null, strokeWidth: 0.5, points: 5, ...patch };
            if (scope === 'all') { decoration.x = (patch.x ?? 5) * card.width / source.width; decoration.y = (patch.y ?? 5) * card.height / source.height; }
            assertDecoration(decoration);
            card.decorations.push(decoration);
            break;
          }
          case 'update-decoration': {
            const decoration = card.decorations.find(item => item.id === command.decorationId);
            if (!decoration) throw new Error('Декорация не найдена.');
            Object.assign(decoration, command.patch);
            assertDecoration(decoration);
            break;
          }
          case 'remove-decoration': {
            if (!card.decorations.some(item => item.id === command.decorationId)) throw new Error('Декорация не найдена.');
            card.decorations = card.decorations.filter(item => item.id !== command.decorationId);
            break;
          }
          case 'remove-decoration-type': card.decorations = card.decorations.filter(item => item.type !== command.decorationType); break;
          case 'apply-decoration-type':
            for (const decoration of card.decorations.filter(item => item.type === command.decorationType)) {
              // Only style properties can be shared; sizes and positions stay individual.
              const { fill, stroke, strokeWidth, points } = command.patch;
              if (fill !== undefined) decoration.fill = fill;
              if (stroke !== undefined) decoration.stroke = stroke;
              if (strokeWidth !== undefined) decoration.strokeWidth = strokeWidth;
              if (points !== undefined) decoration.points = points;
              assertDecoration(decoration);
            }
            break;
          case 'set-hole': card.hole = command.enabled ? card.hole ?? createHole(card) : null; break;
          case 'move-hole':
            if (!card.hole) throw new Error('Сначала добавьте отверстие.');
            if (!isHoleInside(card, command.patch)) throw new Error('Отверстие должно целиком находиться внутри карточки.');
            card.hole = { ...command.patch };
            break;
        }
      }
    }
    result.changedCardIds = next.cards.filter((card, index) => JSON.stringify(card) !== JSON.stringify(project.cards[index])).map(card => card.id);
    result.changed = next.name !== project.name || next.holeEnabled !== project.holeEnabled || result.changedCardIds.length > 0;
    if (result.skippedCardIds.length) {
      const numbers = project.cards.filter(card => result.skippedCardIds.includes(card.id)).map(card => card.number).join(', ');
      result.warnings.push(`Карточки ${numbers} пропущены: на каждой уже 10 декораций.`);
    }
    return { project: result.changed ? next : project, result };
  } catch (error) {
    return { project, result: { ...emptyResult(), error: error instanceof Error ? error.message : 'Не удалось выполнить действие.' } };
  }
}

function resizeCard(card: Card, patch: { width?: number; height?: number; shape?: Shape }) {
  const shape = patch.shape ?? card.shape;
  let width = patch.width ?? card.width;
  let height = patch.height ?? card.height;
  if (!['rectangle', 'square', 'circle', 'oval', 'tag'].includes(shape) || !positive(width) || !positive(height)) throw new Error('Укажите корректную форму и размеры карточки.');
  if (shape === 'square' || shape === 'circle') { width = patch.width ?? patch.height ?? card.width; height = width; }
  const sx = width / card.width;
  const sy = height / card.height;
  card.shape = shape;
  card.width = width;
  card.height = height;
  card.text = { ...card.text, x: card.text.x * sx, y: card.text.y * sy, width: card.text.width * sx, height: card.text.height * sy };
  const scale = Math.min(sx, sy);
  card.illustration = { ...card.illustration, x: card.illustration.x * sx, y: card.illustration.y * sy, width: card.illustration.width * scale, height: card.illustration.height * scale };
  card.decorations = card.decorations.map(item => ({ ...item, x: item.x * sx, y: item.y * sy, width: item.width * scale, height: item.height * scale }));
  for (const decoration of card.decorations) assertDecoration(decoration);
  if (card.hole) {
    card.hole = { x: card.hole.x * sx, y: card.hole.y * sy };
    if (!isHoleInside(card, card.hole)) throw new Error('После изменения формы отверстие окажется за границами. Переместите или удалите его перед изменением.');
  }
}

function createHole(card: Card): Hole {
  const hole = defaultHole(card);
  if (!isHoleInside(card, hole)) throw new Error('Карточка слишком мала для отверстия.');
  return hole;
}

