import { boxPoints } from '../geometry';
import { getPostcardSize, type PostcardElement, type PostcardFormat, type PostcardTemplate } from './types';

/** Fit the whole composition together, always starting from the authored layout. */
export function fitPostcardTemplate(template: PostcardTemplate, format: PostcardFormat): PostcardTemplate {
  if (format === template.format) return template;
  if (!template.elements.length) return { ...template, format };

  const points = template.elements.flatMap(element => boxPoints(element, element.rotation));
  const left = Math.min(...points.map(([x]) => x)), top = Math.min(...points.map(([, y]) => y));
  const width = Math.max(...points.map(([x]) => x)) - left;
  const height = Math.max(...points.map(([, y]) => y)) - top;
  const target = getPostcardSize({ format });
  const margin = 3;
  const scale = Math.min((target.width - margin * 2) / width, (target.height - margin * 2) / height);
  const x = (target.width - width * scale) / 2, y = (target.height - height * scale) / 2;
  const elements = template.elements.map((element): PostcardElement => {
    const box = { x: x + (element.x - left) * scale, y: y + (element.y - top) * scale, width: element.width * scale, height: element.height * scale };
    if (element.type === 'text') return {
      ...element, ...box, fontSize: element.fontSize * scale, letterSpacing: element.letterSpacing * scale,
      stroke: element.stroke && { ...element.stroke, width: element.stroke.width * scale },
      shadow: element.shadow && { ...element.shadow, offsetX: element.shadow.offsetX * scale, offsetY: element.shadow.offsetY * scale, blur: element.shadow.blur * scale },
    };
    if (element.type === 'decoration') return { ...element, ...box, strokeWidth: element.strokeWidth * scale };
    return { ...element, ...box };
  });
  return { ...template, format, elements };
}
