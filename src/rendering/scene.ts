import type { Box, Card } from '../domain/types';
import { ptToMm } from '../domain/types';
import type { Postcard, PostcardBackground, PostcardDecorationElement, PostcardElement, PostcardImageElement, PostcardLetteringElement, PostcardTextElement } from '../domain/postcards/types';
import { getPostcardSize } from '../domain/postcards/types';
import { boxPoints, holeDiameter, shapePath } from '../domain/geometry';
import { assetUrl } from '../content/assets';
import { getPostcardResource } from '../content/postcard-assets';
import { getPostcardFontState, getPostcardTextInkBounds, getPostcardTextMeasurer } from './postcard-fonts';
import { layoutText, type MeasureText, type TextLayout } from './text';

interface SceneNodeBase {
  id: string;
  box: Box;
  rotation: number;
  locked: boolean;
  bounds: Box;
  clipToShape: boolean;
  /** Legacy tag selectors remain stable while scenes use one ordered node list. */
  elementKind: 'text' | 'illustration' | 'image' | 'lettering' | 'decoration';
}
export interface SceneTextNode extends SceneNodeBase { type: 'text'; element: PostcardTextElement; layout: TextLayout }
export interface SceneGraphicNode extends SceneNodeBase { type: 'image' | 'lettering'; element: PostcardImageElement | PostcardLetteringElement; href: string; printHref: string; previewHref: string }
export interface SceneDecorationNode extends SceneNodeBase { type: 'decoration'; element: PostcardDecorationElement; href?: string; printHref?: string; previewHref?: string }
export type PostcardSceneNode = SceneTextNode | SceneGraphicNode | SceneDecorationNode;
export interface EditorScene {
  id: string;
  width: number;
  height: number;
  background: PostcardBackground;
  backgroundImage?: { href: string; printHref: string; previewHref: string };
  nodes: PostcardSceneNode[];
  shape: string;
  hole?: { x: number; y: number; diameter: number };
  product: 'tags' | 'postcards';
  label: string;
}
export type PostcardScene = EditorScene;
export interface PostcardSceneOptions {
  quality?: 'preview' | 'print';
  /** The font registry and export inject the same kerning and spacing measurer. */
  measureText?: (element: PostcardTextElement) => MeasureText;
}

function rotatedBounds(box: Box, element: Pick<PostcardElement, 'x' | 'y' | 'width' | 'height' | 'rotation'>): Box {
  // Effects extend around the element, but rotation still uses the element centre.
  const cx = element.x + element.width / 2, cy = element.y + element.height / 2;
  const angle = element.rotation * Math.PI / 180;
  const points = boxPoints(box).map(([x, y]) => [cx + (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle), cy + (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle)]);
  const left = Math.min(...points.map(point => point[0])), top = Math.min(...points.map(point => point[1]));
  return { x: left, y: top, width: Math.max(...points.map(point => point[0])) - left, height: Math.max(...points.map(point => point[1])) - top };
}

/** One visible bounding box for live checks, preflight and the renderer's effects. */
export function postcardElementVisualBounds(element: PostcardElement, textLayout?: TextLayout): Box {
  let left = element.x, top = element.y, right = element.x + element.width, bottom = element.y + element.height;
  if (element.type === 'text') {
    const layout = textLayout ?? layoutText(element, getPostcardTextMeasurer(element));
    const width = Math.max(0, ...layout.widths);
    const textLeft = element.align === 'center' ? element.x + (element.width - width) / 2 : element.align === 'right' ? element.x + element.width - width : element.x;
    left = Math.min(left, textLeft); right = Math.max(right, textLeft + width); bottom = Math.max(bottom, element.y + layout.height);
    const ink = getPostcardTextInkBounds(element, layout);
    if (ink) { left = Math.min(left, ink.x); top = Math.min(top, ink.y); right = Math.max(right, ink.x + ink.width); bottom = Math.max(bottom, ink.y + ink.height); }
    const stroke = ptToMm(element.stroke?.width ?? 0) / 2;
    left -= stroke; top -= stroke; right += stroke; bottom += stroke;
    if (element.shadow) {
      const blur = element.shadow.blur * 3;
      const shadow = element.shadow;
      left += Math.min(0, shadow.offsetX - blur); right += Math.max(0, shadow.offsetX + blur);
      top += Math.min(0, shadow.offsetY - blur); bottom += Math.max(0, shadow.offsetY + blur);
    }
  } else if (element.type === 'decoration' && !element.assetId && element.stroke) {
    const stroke = ptToMm(element.strokeWidth) / 2;
    left -= stroke; top -= stroke; right += stroke; bottom += stroke;
  }
  return rotatedBounds({ x: left, y: top, width: right - left, height: bottom - top }, element);
}

function sceneNode(element: PostcardElement, options: PostcardSceneOptions = {}): PostcardSceneNode {
  const box = { x: element.x, y: element.y, width: element.width, height: element.height };
  const base = { id: element.id, box, rotation: element.rotation, locked: element.locked, clipToShape: true, elementKind: element.type };
  if (element.type === 'text') {
    const resolved = getPostcardFontState(element).text;
    const layout = layoutText(resolved, options.measureText?.(resolved) ?? getPostcardTextMeasurer(element));
    return { ...base, type: 'text', element: resolved, layout, bounds: postcardElementVisualBounds(resolved, layout) };
  }
  const resource = element.type === 'decoration' ? element.assetId && getPostcardResource('decoration', element.assetId) : getPostcardResource(element.type, element.assetId);
  const previewHref = resource ? assetUrl(resource.preview) : '', printHref = resource ? assetUrl(resource.print) : '';
  const href = options.quality === 'print' ? printHref : previewHref;
  const bounds = postcardElementVisualBounds(element);
  if (element.type === 'decoration') return { ...base, type: 'decoration', element, bounds, href, printHref, previewHref };
  return { ...base, type: element.type, element, bounds, href, printHref, previewHref };
}

const sceneCache = new WeakMap<Postcard, PostcardScene>();
/** Element order is the only z-order; immutable documents allow preview scene reuse. */
export function createPostcardScene(postcard: Postcard, options: PostcardSceneOptions = {}): PostcardScene {
  // Font completion changes metrics without changing the document, so only graphic-only scenes cache.
  const cacheable = !options.measureText && options.quality !== 'print' && !postcard.elements.some(element => element.type === 'text');
  const cached = cacheable && sceneCache.get(postcard);
  if (cached) return cached;
  const { width, height } = getPostcardSize(postcard);
  const resource = postcard.background.kind === 'image' ? getPostcardResource('background', postcard.background.assetId) : undefined;
  const previewHref = resource ? assetUrl(resource.preview) : '', printHref = resource ? assetUrl(resource.print) : '';
  const scene: PostcardScene = {
    id: postcard.id, width, height, background: postcard.background,
    backgroundImage: resource ? { href: options.quality === 'print' ? printHref : previewHref, previewHref, printHref } : undefined,
    nodes: postcard.elements.map(element => sceneNode(element, options)),
    shape: `M 0 0 H ${width} V ${height} H 0 Z`, product: 'postcards', label: 'Открытка',
  };
  if (cacheable) sceneCache.set(postcard, scene);
  return scene;
}

/** Adapter retains the v1 tag model, shape, hole and historical layer order. */
export function createTagScene(card: Card, quality: 'preview' | 'print' = 'preview'): EditorScene {
  const decorations = card.decorations.map(item => ({ ...item, type: 'decoration' as const, shape: item.type, rotation: 0, locked: false, opacity: 1 }));
  const illustration: PostcardImageElement = { ...card.illustration, id: 'illustration', type: 'image', locked: false, opacity: 1 };
  const text: PostcardTextElement = { ...card.text, id: 'text', type: 'text', rotation: 0, locked: false, lineHeight: 1.22, letterSpacing: 0, stroke: null, shadow: null };
  const nodes: PostcardSceneNode[] = [...decorations, illustration].map(element => sceneNode(element, { quality }));
  nodes.push({ id: 'text', type: 'text', element: text, box: card.text, rotation: 0, locked: false, bounds: card.text, clipToShape: false, elementKind: 'text', layout: layoutText(card.text) });
  const imageNode = nodes.find(node => node.id === 'illustration');
  if (imageNode) imageNode.elementKind = 'illustration';
  return { id: card.id, width: card.width, height: card.height, background: card.background, nodes, shape: shapePath(card), product: 'tags', label: `Карточка ${card.number}`, hole: card.hole ? { ...card.hole, diameter: holeDiameter(card) } : undefined };
}
