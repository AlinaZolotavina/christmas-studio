export type Shape = 'rectangle' | 'square' | 'circle' | 'oval' | 'tag';
export type FontId = 'sans' | 'serif' | 'script';
export type Scope = 'current' | 'all';
export type ElementKind = 'card' | 'text' | 'illustration' | 'decoration' | 'hole';
export interface Box { x: number; y: number; width: number; height: number }
export interface Background {
  kind: 'solid' | 'linear' | 'radial';
  colors: string[];
  angle: number;
  centerX: number;
  centerY: number;
}
export interface TextElement extends Box {
  content: string;
  fontId: FontId;
  fontSize: number;
  weight: 'normal' | 'bold';
  italic: boolean;
  color: string;
  align: 'left' | 'center' | 'right';
}
export interface Illustration extends Box { assetId: string; rotation: number }
export interface Decoration extends Box {
  id: string;
  type: 'circle' | 'star';
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  points: number;
}
export interface Hole { x: number; y: number }
export interface Card {
  id: string;
  number: number;
  shape: Shape;
  width: number;
  height: number;
  background: Background;
  text: TextElement;
  illustration: Illustration;
  decorations: Decoration[];
  hole: Hole | null;
}
export interface ProjectDocument {
  schemaVersion: 1;
  id: string;
  name: string;
  templateId: string;
  cardCount: 24 | 31;
  cards: Card[];
  holeEnabled: boolean;
}
export interface Selection { kind: ElementKind; decorationId?: string }
export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning' | 'recommendation';
  message: string;
  cardId?: string;
  element?: ElementKind;
  pageIndex?: number;
}
export interface AssetDefinition {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  preview: string;
  print: string;
}
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  eyebrow: string;
  color: string;
  background: string;
  shape: Shape;
  fontId: FontId;
  assetIds: string[];
  requiredAssetIds?: string[];
  alternateSubcategories?: boolean;
}
export interface FontDefinition {
  id: FontId;
  family: string;
  name: string;
  regular: string;
  bold?: string;
  italic?: string;
  boldItalic?: string;
}
export const SCHEMA_VERSION = 1;
export const MAX_DECORATIONS = 25;
export const HISTORY_LIMIT = 15;
export const MAX_TEXT_LENGTH = 6000;
export const mmToPt = (mm: number) => mm * 72 / 25.4;
export const ptToMm = (pt: number) => pt * 25.4 / 72;
