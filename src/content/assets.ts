import { images } from '../data/images';
import type { AssetDefinition } from '../domain/types';
import dimensions from './image-dimensions.json';

export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export const assets: AssetDefinition[] = images.map(image => ({
  id: image.id,
  name: image.name.ru,
  category: image.category,
  ...(dimensions as Record<string, { width: number; height: number }>)[image.id],
  preview: `art/${image.id}-preview.webp`,
  print: image.src,
}));

export function getAsset(id: string): AssetDefinition {
  const asset = assets.find(item => item.id === id);
  if (!asset) throw new Error(`Иллюстрация не найдена: ${id}`);
  return asset;
}
