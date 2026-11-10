import { assets } from '../content/assets';
import { templates } from '../content/templates';
import { getImage } from '../data/images';
import type { AssetDefinition, Card, ProjectDocument, TemplateDefinition } from './types';
import { defaultHole } from './geometry';

export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function shuffled<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const random = rng();
    if (!Number.isFinite(random) || random < 0 || random >= 1) throw new Error('Генератор случайных чисел вернул недопустимое значение.');
    const target = Math.floor(random * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

/** Randomly choose among groups that still allow a complete non-adjacent order. */
function alternateSubcategories(selected: AssetDefinition[], rng: () => number): AssetDefinition[] {
  const groups = new Map<string, AssetDefinition[]>();
  for (const asset of shuffled(selected, rng)) {
    const subcategory = getImage(asset.id)?.subcategory;
    if (!subcategory) throw new Error('Для иллюстрации набора не указана подкатегория.');
    groups.set(subcategory, [...(groups.get(subcategory) ?? []), asset]);
  }
  const result: AssetDefinition[] = [];
  let previous = '';
  while (result.length < selected.length) {
    const remainingLength = selected.length - result.length - 1;
    const candidates = [...groups].filter(([subcategory, items]) => items.length && subcategory !== previous && [...groups].every(([other, pending]) => {
      const remaining = pending.length - (other === subcategory ? 1 : 0);
      return remaining <= remainingLength - remaining + (other === subcategory ? 0 : 1);
    }));
    const chosen = shuffled(candidates, rng)[0];
    if (!chosen) throw new Error('В этом наборе не хватает разных подкатегорий для чередования карточек.');
    previous = chosen[0];
    result.push(chosen[1].pop()!);
  }
  return result;
}

function initialCard(template: TemplateDefinition, asset: AssetDefinition, number: number, id: string = makeId()): Card {
  const width = 50;
  const height = template.shape === 'circle' || template.shape === 'square' ? width : 80;
  const illustrationBox = { x: 5, y: 10, width: width - 10, height: height - 33 };
  const scale = Math.min(illustrationBox.width / asset.width, illustrationBox.height / asset.height);
  const imageWidth = asset.width * scale;
  const imageHeight = asset.height * scale;
  return {
    id, number, shape: template.shape, width, height,
    background: { kind: 'solid', colors: [template.background], angle: 90, centerX: 0.5, centerY: 0.5 },
    text: {
      x: 5, y: height - 20, width: width - 10, height: 15,
      content: String(number), fontId: template.fontId, fontSize: 28,
      weight: 'normal', italic: false, color: template.color, align: 'center',
    },
    illustration: {
      assetId: asset.id, rotation: 0,
      x: illustrationBox.x + (illustrationBox.width - imageWidth) / 2,
      y: illustrationBox.y + (illustrationBox.height - imageHeight) / 2,
      width: imageWidth, height: imageHeight,
    },
    decorations: [], hole: template.shape === 'tag' ? defaultHole({ width }) : null,
  };
}

/** The RNG is injectable; the selected illustration IDs become persistent document data. */
export function createProject(templateId: string, count: 24 | 31, rng: () => number = Math.random): ProjectDocument {
  if (count !== 24 && count !== 31) throw new Error('Выберите набор из 24 или 31 карточки.');
  const template = templates.find(item => item.id === templateId);
  if (!template) throw new Error('Шаблон не найден.');
  const preferred = template.assetIds.map(id => assets.find(asset => asset.id === id)).filter((asset): asset is AssetDefinition => Boolean(asset));
  const curated = [...new Map(preferred.map(asset => [asset.id, asset])).values()];
  if (curated.length < count) throw new Error('В библиотеке недостаточно уникальных иллюстраций для этого набора.');
  const requiredIds = new Set(template.requiredAssetIds ?? []);
  const required = curated.filter(asset => requiredIds.has(asset.id));
  if (required.length !== requiredIds.size) throw new Error('В библиотеке отсутствуют обязательные иллюстрации набора.');
  let selected = [
    ...shuffled(required, rng).slice(0, count),
    ...shuffled(curated.filter(asset => !requiredIds.has(asset.id)), rng).slice(0, Math.max(0, count - required.length)),
  ];
  if (template.alternateSubcategories) selected = alternateSubcategories(selected, rng);
  return {
    schemaVersion: 1, id: makeId(), name: 'Мой адвент-календарь', templateId,
    cardCount: count, holeEnabled: template.shape === 'tag',
    cards: selected.map((asset, index) => initialCard(template, asset, index + 1)),
  };
}

/** Restore template defaults without assigning different artwork or replacing stable identities. */
export function resetProject(project: ProjectDocument): ProjectDocument {
  const template = templates.find(item => item.id === project.templateId);
  if (!template) throw new Error('Исходный шаблон проекта не найден.');
  if ((project.cardCount !== 24 && project.cardCount !== 31) || project.cards.length !== project.cardCount) throw new Error('Нарушен состав карточек проекта.');
  const cards = project.cards.map((card, index) => {
    if (card.number !== index + 1) throw new Error('Нарушен постоянный порядок карточек проекта.');
    const asset = assets.find(item => item.id === card.illustration.assetId);
    if (!asset) throw new Error(`Иллюстрация карточки ${card.number} не найдена в библиотеке.`);
    return initialCard(template, asset, card.number, card.id);
  });
  return { ...project, cards, holeEnabled: template.shape === 'tag' };
}
