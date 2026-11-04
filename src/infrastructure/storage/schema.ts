import { assets } from '../../content/assets';
import { imageAliases } from '../../data/images';
import { templates } from '../../content/templates';
import { isHoleInside } from '../../domain/geometry';
import { MAX_DECORATIONS, MAX_TEXT_LENGTH } from '../../domain/types';
import type { Card, ProjectDocument } from '../../domain/types';

const assetIds = new Set([...assets.map(asset => asset.id), ...Object.keys(imageAliases)]);
const templateIds = new Set(templates.map(template => template.id));
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const positive = (value: unknown): value is number => finite(value) && value > 0;
const id = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 256;
export const isColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function box(value: Record<string, unknown>, label: string) {
  assert(finite(value.x) && finite(value.y) && positive(value.width) && positive(value.height), `${label}: некорректные координаты или размеры.`);
  assert(Number.isFinite(value.x + value.width) && Number.isFinite(value.y + value.height), `${label}: размеры превышают доступный диапазон.`);
}

/** Validate all persisted leaves before the document reaches React, SVG or PDF. */
export function validateProject(value: unknown): ProjectDocument {
  assert(isRecord(value), 'Вместо проекта сохранены некорректные данные.');
  assert(value.schemaVersion === 1, 'Эта версия проекта пока не поддерживается. Исходные данные сохранены для восстановления.');
  assert(id(value.id), 'Отсутствует идентификатор проекта.');
  assert(typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 120, 'Некорректное название проекта.');
  assert(typeof value.templateId === 'string' && templateIds.has(value.templateId), 'Шаблон сохранённого проекта не найден.');
  assert(value.cardCount === 24 || value.cardCount === 31, 'Некорректное количество карточек.');
  assert(typeof value.holeEnabled === 'boolean', 'Некорректная настройка отверстий проекта.');
  assert(Array.isArray(value.cards) && value.cards.length === value.cardCount, 'Количество карточек не совпадает с составом проекта.');
  const cardIds = new Set<string>();
  for (const [index, card] of value.cards.entries()) {
    const label = `Карточка ${index + 1}`;
    assert(isRecord(card) && id(card.id) && !cardIds.has(card.id), `${label}: некорректный или повторяющийся идентификатор.`);
    cardIds.add(card.id);
    assert(card.number === index + 1, `${label}: нарушен постоянный порядок карточек.`);
    assert(typeof card.shape === 'string' && ['rectangle', 'square', 'circle', 'oval', 'tag'].includes(card.shape), `${label}: неизвестная форма.`);
    assert(positive(card.width) && positive(card.height), `${label}: размеры должны быть конечными положительными числами.`);
    assert(card.shape !== 'circle' && card.shape !== 'square' || Math.abs(card.width - card.height) < 0.000001, `${label}: у круга и квадрата размеры сторон должны совпадать.`);

    const text = card.text;
    assert(isRecord(text), `${label}: отсутствует текстовый блок.`);
    box(text, `${label}, текст`);
    assert(typeof text.content === 'string' && text.content.length <= MAX_TEXT_LENGTH, `${label}: некорректное содержимое текста.`);
    assert(finite(text.fontSize) && text.fontSize >= 6 && text.fontSize <= 72, `${label}: размер шрифта должен быть от 6 до 72 pt.`);
    assert(typeof text.fontId === 'string' && ['sans', 'serif', 'script'].includes(text.fontId), `${label}: неизвестный шрифт.`);
    assert(text.weight === 'normal' || text.weight === 'bold', `${label}: неизвестная насыщенность шрифта.`);
    assert(typeof text.italic === 'boolean' && isColor(text.color), `${label}: некорректный стиль текста.`);
    assert(typeof text.align === 'string' && ['left', 'center', 'right'].includes(text.align), `${label}: некорректное выравнивание текста.`);

    const illustration = card.illustration;
    assert(isRecord(illustration), `${label}: отсутствует основная иллюстрация.`);
    box(illustration, `${label}, иллюстрация`);
    assert(typeof illustration.assetId === 'string' && assetIds.has(illustration.assetId), `${label}: сохранённая иллюстрация не найдена в библиотеке.`);
    assert(finite(illustration.rotation), `${label}: некорректный угол иллюстрации.`);

    const background = card.background;
    assert(isRecord(background), `${label}: отсутствует фон.`);
    assert(typeof background.kind === 'string' && ['solid', 'linear', 'radial'].includes(background.kind), `${label}: неизвестный тип фона.`);
    assert(Array.isArray(background.colors) && background.colors.length >= 1 && background.colors.length <= 3 && background.colors.every(isColor), `${label}: некорректные цвета фона.`);
    assert(finite(background.angle) && finite(background.centerX) && finite(background.centerY) && background.centerX >= 0 && background.centerX <= 1 && background.centerY >= 0 && background.centerY <= 1, `${label}: некорректная геометрия градиента.`);

    assert(Array.isArray(card.decorations) && card.decorations.length <= MAX_DECORATIONS, `${label}: может содержать не более ${MAX_DECORATIONS} декораций.`);
    const decorationIds = new Set<string>();
    for (const decoration of card.decorations) {
      assert(isRecord(decoration) && id(decoration.id) && !decorationIds.has(decoration.id), `${label}: некорректный идентификатор декорации.`);
      decorationIds.add(decoration.id);
      box(decoration, `${label}, декорация`);
      assert((decoration.width as number) <= 20 && (decoration.height as number) <= 20, `${label}: декорация превышает размер 2 см.`);
      assert(decoration.type === 'circle' || decoration.type === 'star', `${label}: неизвестная декорация.`);
      assert((decoration.fill === null || isColor(decoration.fill)) && (decoration.stroke === null || isColor(decoration.stroke)), `${label}: некорректные цвета декорации.`);
      assert(finite(decoration.strokeWidth) && decoration.strokeWidth >= 0.25 && decoration.strokeWidth <= 3, `${label}: некорректная толщина обводки.`);
      assert(finite(decoration.points) && Number.isInteger(decoration.points) && decoration.points >= 4 && decoration.points <= 8, `${label}: звезда должна иметь от 4 до 8 лучей.`);
    }

    if (card.hole !== null) {
      assert(isRecord(card.hole) && finite(card.hole.x) && finite(card.hole.y), `${label}: некорректное отверстие.`);
      assert(isHoleInside(card as unknown as Card, { x: card.hole.x, y: card.hole.y }), `${label}: отверстие находится за границами карточки.`);
    }
  }
  return value as unknown as ProjectDocument;
}

export function decodeProject(raw: string): ProjectDocument {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('Не удалось прочитать JSON проекта. Исходные данные можно скачать.'); }
  return validateProject(value);
}

/** Repair only omitted, unambiguous v1 defaults; never invent missing artwork or text. */
export function repairProject(raw: string): ProjectDocument {
  const value: unknown = JSON.parse(raw);
  assert(isRecord(value) && value.schemaVersion === 1 && Array.isArray(value.cards), 'Автоматически восстановить эту версию проекта не удалось.');
  value.holeEnabled ??= false;
  for (const card of value.cards) {
    if (!isRecord(card)) continue;
    card.decorations ??= [];
    card.hole ??= null;
    if (isRecord(card.background)) {
      card.background.angle ??= 90;
      card.background.centerX ??= 0.5;
      card.background.centerY ??= 0.5;
    }
    if (isRecord(card.illustration)) card.illustration.rotation ??= 0;
    if (isRecord(card.text)) {
      card.text.weight ??= 'normal';
      card.text.italic ??= false;
    }
  }
  return validateProject(value);
}
