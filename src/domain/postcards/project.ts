import { makeId } from '../project';
import { assets } from '../../content/assets';
import { resolveImageId } from '../../data/images';
import letteringDimensions from '../../content/lettering-dimensions.json';
import { validatePostcard, validatePostcardElement, validatePostcardProject } from './validation';
import type { CreatePostcardProjectOptions, Postcard, PostcardDecorationElement, PostcardElement, PostcardFormat, PostcardImageElement, PostcardLetteringElement, PostcardProject, PostcardTemplate, PostcardTextElement } from './types';

export const blankPostcardBackground = () => ({ kind: 'solid' as const, colors: ['#FFFFFF'], angle: 90, centerX: 0.5, centerY: 0.5 });
export const snapPostcardRotation = (rotation: number) => ((Math.round(rotation / 15) * 15) % 360 + 360) % 360;
const base = () => ({ id: makeId(), x: 10, y: 10, width: 40, height: 40, rotation: 0, locked: false });
type Patch<T> = Partial<Omit<T, 'id' | 'type'>>;

export function createTextElement(patch: Patch<PostcardTextElement> = {}): PostcardTextElement {
  const element: PostcardTextElement = { ...base(), type: 'text', width: 80, height: 25, content: 'С Новым годом!', fontId: 'sans', fontSize: 24, weight: 'normal', italic: false, color: '#36523C', align: 'center', lineHeight: 1.2, letterSpacing: 0, stroke: null, shadow: null, ...structuredClone(patch) };
  element.rotation = snapPostcardRotation(element.rotation);
  return validatePostcardElement(element) as PostcardTextElement;
}
function graphicBox(width: number, height: number) {
  const scale = Math.min(50 / width, 60 / height);
  return { width: width * scale, height: height * scale };
}
export function createImageElement(assetId: string, patch: Patch<PostcardImageElement> = {}): PostcardImageElement {
  const asset = assets.find(item => item.id === resolveImageId(assetId));
  if (!asset) throw new Error('Иллюстрация не найдена в библиотеке.');
  const element: PostcardImageElement = { ...base(), ...graphicBox(asset.width, asset.height), type: 'image', assetId, opacity: 1, ...structuredClone(patch) };
  element.rotation = snapPostcardRotation(element.rotation);
  return validatePostcardElement(element) as PostcardImageElement;
}
export function createLetteringElement(assetId: string, patch: Patch<PostcardLetteringElement> = {}): PostcardLetteringElement {
  const dimensions = (letteringDimensions as Record<string, { width: number; height: number }>)[assetId];
  if (!dimensions) throw new Error('Графическая надпись не найдена в библиотеке.');
  const element: PostcardLetteringElement = { ...base(), ...graphicBox(dimensions.width, dimensions.height), type: 'lettering', assetId, opacity: 1, ...structuredClone(patch) };
  element.rotation = snapPostcardRotation(element.rotation);
  return validatePostcardElement(element) as PostcardLetteringElement;
}
export function createDecorationElement(patch: Patch<PostcardDecorationElement> = {}): PostcardDecorationElement {
  const element: PostcardDecorationElement = { ...base(), width: 15, height: 15, type: 'decoration', shape: 'star', fill: '#C2A26B', stroke: null, strokeWidth: 0.5, points: 5, opacity: 1, ...structuredClone(patch) };
  element.rotation = snapPostcardRotation(element.rotation);
  return validatePostcardElement(element) as PostcardDecorationElement;
}
export const clonePostcardElement = (element: PostcardElement): PostcardElement => ({ ...structuredClone(element), id: makeId() });
export function createPostcard(format: PostcardFormat, template?: PostcardTemplate, cornerRadius = 0): Postcard {
  const card: Postcard = { id: makeId(), format, cornerRadius, background: template ? structuredClone(template.background) : blankPostcardBackground(), elements: template ? template.elements.map(element => ({ ...clonePostcardElement(element), locked: false })) : [] };
  return validatePostcard(card);
}
export function clonePostcard(card: Postcard): Postcard {
  return validatePostcard({ ...structuredClone(card), id: makeId(), elements: card.elements.map(clonePostcardElement) });
}
export function createPostcardProject(options: CreatePostcardProjectOptions): PostcardProject {
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > 20) throw new Error('В проекте должно быть от 1 до 20 открыток.');
  const cornerRadius = options.cornerRadius ?? 0;
  const postcards = Array.from({ length: options.count }, (_, index) => createPostcard(options.format, index === 0 || options.applyToAll ? options.template : undefined, cornerRadius));
  return validatePostcardProject({ schemaVersion: 1, product: 'postcards', id: makeId(), name: options.name ?? 'Мои открытки', defaultFormat: options.format, defaultCornerRadius: cornerRadius, postcards, activePostcardId: postcards[0].id });
}
