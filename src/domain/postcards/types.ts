import type { LocalizedLabel } from '../../data/images';
import type { Background, Box, FontId } from '../types';

export type PostcardFormat = 'a6-portrait' | 'a6-landscape' | 'square';
export const FORMAT_SIZES: Record<PostcardFormat, { width: number; height: number }> = {
  'a6-portrait': { width: 105, height: 148 },
  'a6-landscape': { width: 148, height: 105 },
  square: { width: 105, height: 105 },
};
export const MAX_POSTCARDS = 20;
export const MAX_POSTCARD_ELEMENTS = 100;
export const MAX_POSTCARD_CORNER_RADIUS = 20;
export type PostcardBackground = Background | { kind: 'image'; assetId: string; color: string };
export interface PostcardElementBase extends Box { id: string; rotation: number; locked: boolean }
export interface PostcardTextElement extends PostcardElementBase {
  type: 'text';
  content: string;
  fontId: FontId;
  fontSize: number;
  weight: 'normal' | 'bold';
  italic: boolean;
  color: string;
  align: 'left' | 'center' | 'right';
  /** Unitless multiplier of font size. */
  lineHeight: number;
  /** Points, independent of the text box width. */
  letterSpacing: number;
  stroke: { color: string; width: number } | null;
  /** Millimetres; blur is the SVG Gaussian standard deviation. */
  shadow: { color: string; offsetX: number; offsetY: number; blur: number } | null;
}
export interface PostcardImageElement extends PostcardElementBase { type: 'image'; assetId: string; opacity: number }
export interface PostcardLetteringElement extends PostcardElementBase { type: 'lettering'; assetId: string; opacity: number }
export interface PostcardDecorationElement extends PostcardElementBase {
  type: 'decoration';
  shape: 'circle' | 'star' | 'line';
  assetId?: string;
  fill: string | null;
  stroke: string | null;
  /** Points. */
  strokeWidth: number;
  points: number;
  opacity: number;
}
export type PostcardElement = PostcardTextElement | PostcardImageElement | PostcardLetteringElement | PostcardDecorationElement;
export type PostcardElementPatch = Partial<Omit<PostcardTextElement, 'id' | 'type' | 'locked'>>
  | Partial<Omit<PostcardImageElement, 'id' | 'type' | 'locked'>>
  | Partial<Omit<PostcardLetteringElement, 'id' | 'type' | 'locked'>>
  | Partial<Omit<PostcardDecorationElement, 'id' | 'type' | 'locked'>>;
export type PostcardSelection = string | null;
export interface Postcard {
  id: string;
  format: PostcardFormat;
  /** Millimetres; omitted in older v1 documents, equivalent to zero. */
  cornerRadius?: number;
  background: PostcardBackground;
  elements: PostcardElement[];
}
export interface PostcardProject {
  schemaVersion: 1;
  product: 'postcards';
  id: string;
  name: string;
  defaultFormat: PostcardFormat;
  /** Millimetres, for newly added postcards; older v1 documents default to zero. */
  defaultCornerRadius?: number;
  postcards: Postcard[];
  activePostcardId: string;
}
export interface PostcardTemplate {
  id: string;
  name: LocalizedLabel;
  description?: LocalizedLabel;
  format: PostcardFormat;
  background: PostcardBackground;
  elements: PostcardElement[];
}
export interface CreatePostcardProjectOptions { name?: string; count: number; format: PostcardFormat; cornerRadius?: number; template?: PostcardTemplate; applyToAll?: boolean }
export const getPostcardSize = (postcard: Pick<Postcard, 'format'>) => FORMAT_SIZES[postcard.format];
