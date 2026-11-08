import { images, imageAliases } from '../../data/images';
import { backgrounds } from '../../data/backgrounds';
import { lettering } from '../../data/lettering';
import { decorations } from '../../data/decorations';
import { MAX_TEXT_LENGTH } from '../types';
import { FORMAT_SIZES, MAX_POSTCARDS, MAX_POSTCARD_ELEMENTS, MAX_POSTCARD_CORNER_RADIUS } from './types';
import type { Postcard, PostcardBackground, PostcardElement, PostcardProject } from './types';

const imageIds = new Set([...images.map(image => image.id), ...Object.keys(imageAliases)]);
const backgroundIds = new Set(backgrounds.map(image => image.id));
const letteringIds = new Set(lettering.map(image => image.id));
const decorationIds = new Set(decorations.map(image => image.id));
export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const positive = (value: unknown): value is number => finite(value) && value > 0;
const isId = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 256;
const color = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
export function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
export const isPostcardFormat = (value: unknown) => typeof value === 'string' && Object.hasOwn(FORMAT_SIZES, value);
const validCornerRadius = (value: unknown) => value === undefined || finite(value) && value >= 0 && value <= MAX_POSTCARD_CORNER_RADIUS;

export function validatePostcardBackground(value: unknown): PostcardBackground {
  assert(isRecord(value), 'Отсутствует фон открытки.');
  if (value.kind === 'image') {
    assert(typeof value.assetId === 'string' && backgroundIds.has(value.assetId), 'Фоновое изображение не найдено в библиотеке.');
    assert(color(value.color), 'Под фоновым изображением должен быть непрозрачный цвет.');
  } else {
    assert(['solid', 'linear', 'radial'].includes(String(value.kind)), 'Неизвестный тип фона открытки.');
    assert(Array.isArray(value.colors) && value.colors.length >= 1 && value.colors.length <= 3 && value.colors.every(color), 'Некорректные цвета фона открытки.');
    assert(finite(value.angle) && finite(value.centerX) && finite(value.centerY) && value.centerX >= 0 && value.centerX <= 1 && value.centerY >= 0 && value.centerY <= 1, 'Некорректная геометрия градиента открытки.');
  }
  return value as unknown as PostcardBackground;
}

export function validatePostcardElement(value: unknown): PostcardElement {
  assert(isRecord(value) && isId(value.id), 'Некорректный идентификатор элемента.');
  assert(finite(value.x) && finite(value.y) && positive(value.width) && positive(value.height), 'Положение и размеры элемента должны быть конечными числами; размеры — больше нуля.');
  assert(Number.isFinite(value.x + value.width) && Number.isFinite(value.y + value.height), 'Размеры элемента превышают доступный диапазон.');
  assert(finite(value.rotation) && Math.abs(value.rotation / 15 - Math.round(value.rotation / 15)) < 0.000001, 'Поворот элемента выполняется с шагом 15°.');
  assert(typeof value.locked === 'boolean', 'Некорректное состояние блокировки элемента.');
  if (value.type === 'text') {
    assert(typeof value.content === 'string' && value.content.length <= MAX_TEXT_LENGTH, `Текст может содержать не более ${MAX_TEXT_LENGTH} символов.`);
    assert(['sans', 'serif', 'script'].includes(String(value.fontId)), 'Неизвестный шрифт текста.');
    assert(finite(value.fontSize) && value.fontSize >= 6 && value.fontSize <= 200, 'Размер шрифта должен быть от 6 до 200 pt.');
    assert(['normal', 'bold'].includes(String(value.weight)) && typeof value.italic === 'boolean' && color(value.color) && ['left', 'center', 'right'].includes(String(value.align)), 'Некорректное оформление текста.');
    assert(finite(value.lineHeight) && value.lineHeight >= 0.5 && value.lineHeight <= 4, 'Межстрочный интервал должен быть от 0,5 до 4.');
    assert(finite(value.letterSpacing) && value.letterSpacing >= -20 && value.letterSpacing <= 100, 'Межбуквенный интервал должен быть от −20 до 100 pt.');
    assert(value.stroke === null || isRecord(value.stroke) && color(value.stroke.color) && finite(value.stroke.width) && value.stroke.width >= 0 && value.stroke.width <= 20, 'Некорректная обводка текста.');
    assert(value.shadow === null || isRecord(value.shadow) && color(value.shadow.color) && finite(value.shadow.offsetX) && finite(value.shadow.offsetY) && finite(value.shadow.blur) && value.shadow.blur >= 0 && value.shadow.blur <= 30, 'Некорректная тень текста.');
  } else {
    assert(finite(value.opacity) && value.opacity >= 0 && value.opacity <= 1, 'Прозрачность должна быть от 0 до 1.');
    if (value.type === 'image') assert(typeof value.assetId === 'string' && imageIds.has(value.assetId), 'Иллюстрация не найдена в библиотеке.');
    else if (value.type === 'lettering') assert(typeof value.assetId === 'string' && letteringIds.has(value.assetId), 'Графическая надпись не найдена в библиотеке.');
    else if (value.type === 'decoration') {
      assert(['circle', 'star', 'line'].includes(String(value.shape)), 'Неизвестная форма декора.');
      assert(value.assetId === undefined || typeof value.assetId === 'string' && decorationIds.has(value.assetId), 'Декоративное изображение не найдено в библиотеке.');
      assert((value.fill === null || color(value.fill)) && (value.stroke === null || color(value.stroke)), 'Некорректные цвета декора.');
      assert(finite(value.strokeWidth) && value.strokeWidth >= 0 && value.strokeWidth <= 20, 'Некорректная толщина обводки декора.');
      assert(finite(value.points) && Number.isInteger(value.points) && value.points >= 4 && value.points <= 12, 'Звезда должна иметь от 4 до 12 лучей.');
    } else throw new Error('Неизвестный тип элемента открытки.');
  }
  return value as unknown as PostcardElement;
}

export function validatePostcard(value: unknown): Postcard {
  assert(isRecord(value) && isId(value.id), 'Некорректный идентификатор открытки.');
  assert(isPostcardFormat(value.format), 'Выберите A6 вертикальную, A6 горизонтальную или квадратную открытку.');
  assert(validCornerRadius(value.cornerRadius), `Скругление углов должно быть от 0 до ${MAX_POSTCARD_CORNER_RADIUS} мм.`);
  validatePostcardBackground(value.background);
  assert(Array.isArray(value.elements) && value.elements.length <= MAX_POSTCARD_ELEMENTS, `На открытке может быть не более ${MAX_POSTCARD_ELEMENTS} элементов.`);
  const ids = new Set<string>();
  for (const element of value.elements) {
    const validated = validatePostcardElement(element);
    assert(!ids.has(validated.id), 'Идентификаторы элементов не должны повторяться.');
    ids.add(validated.id);
  }
  return value as unknown as Postcard;
}

/** Validate every persisted leaf before it reaches the scene or exporter. */
export function validatePostcardProject(value: unknown): PostcardProject {
  assert(isRecord(value), 'Вместо проекта открыток сохранены некорректные данные.');
  assert(value.schemaVersion === 1 && value.product === 'postcards', 'Эта версия проекта открыток пока не поддерживается. Исходные данные сохранены.');
  assert(isId(value.id), 'Отсутствует идентификатор проекта открыток.');
  assert(typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 120, 'Название должно содержать от 1 до 120 символов.');
  assert(isPostcardFormat(value.defaultFormat), 'Некорректный формат по умолчанию.');
  assert(validCornerRadius(value.defaultCornerRadius), 'Некорректное скругление углов по умолчанию.');
  assert(Array.isArray(value.postcards) && value.postcards.length >= 1 && value.postcards.length <= MAX_POSTCARDS, `В проекте должно быть от 1 до ${MAX_POSTCARDS} открыток.`);
  const cardIds = new Set<string>();
  const elementIds = new Set<string>();
  for (const card of value.postcards) {
    const validated = validatePostcard(card);
    assert(!cardIds.has(validated.id), 'Идентификаторы открыток не должны повторяться.');
    cardIds.add(validated.id);
    for (const element of validated.elements) {
      assert(!elementIds.has(element.id), 'Элементы разных открыток должны иметь независимые идентификаторы.');
      elementIds.add(element.id);
    }
  }
  assert(typeof value.activePostcardId === 'string' && cardIds.has(value.activePostcardId), 'Активная открытка не найдена в проекте.');
  return value as unknown as PostcardProject;
}
