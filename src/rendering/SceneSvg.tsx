import { useId } from 'react';
import { ptToMm } from '../domain/types';
import { ellipsePath, pathToSvg, starPoints } from '../domain/geometry';
import { FONT_FAMILIES } from './text';
import type { EditorScene, PostcardSceneNode } from './scene';

export interface SceneSvgProps {
  scene: EditorScene;
  className?: string;
  idPrefix?: string;
  print?: boolean;
  /** Export can supply the shared font engine's exact outlines by element ID. */
  textPaths?: Record<string, string>;
}

export function SceneSvg({ scene, className, idPrefix, print = false, textPaths }: SceneSvgProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const prefix = `${idPrefix || reactId}-${scene.id}`.replace(/[^a-zA-Z0-9-]/g, '');
  const background = scene.background;
  const fill = background.kind === 'image' ? background.color : background.kind === 'solid' ? background.colors[0] : `url(#${prefix}-gradient)`;
  const angle = (background.kind === 'image' ? 0 : background.angle) * Math.PI / 180;
  const dx = Math.cos(angle) / 2, dy = Math.sin(angle) / 2;
  const maskLeft = Math.min(-scene.width, ...scene.nodes.map(node => node.bounds.x - scene.width));
  const maskTop = Math.min(-scene.height, ...scene.nodes.map(node => node.bounds.y - scene.height));
  const maskRight = Math.max(scene.width * 2, ...scene.nodes.map(node => node.bounds.x + node.bounds.width + scene.width));
  const maskBottom = Math.max(scene.height * 2, ...scene.nodes.map(node => node.bounds.y + node.bounds.height + scene.height));

  const renderNode = (node: PostcardSceneNode) => {
    const element = node.element;
    const transform = node.rotation ? `rotate(${node.rotation} ${element.x + element.width / 2} ${element.y + element.height / 2})` : undefined;
    let artwork;
    if (node.type === 'text') {
      const text = node.element;
      const x = text.align === 'center' ? text.x + text.width / 2 : text.align === 'right' ? text.x + text.width : text.x;
      const effects = { fill: text.color, stroke: text.stroke?.color || undefined, strokeWidth: text.stroke ? ptToMm(text.stroke.width) : undefined, paintOrder: 'stroke fill' as const, strokeLinejoin: 'round' as const, filter: text.shadow ? `url(#${prefix}-shadow-${node.id})` : undefined };
      artwork = textPaths?.[node.id] !== undefined
        ? <path d={textPaths[node.id]} {...effects} />
        : <text {...effects} fontFamily={FONT_FAMILIES[text.fontId] || FONT_FAMILIES.sans} fontSize={ptToMm(text.fontSize)} fontWeight={text.weight} fontStyle={text.italic ? 'italic' : 'normal'} letterSpacing={ptToMm(text.letterSpacing)} textAnchor={text.align === 'center' ? 'middle' : text.align === 'right' ? 'end' : 'start'} xmlSpace="preserve">
          {node.layout.lines.map((line, index) => <tspan key={index} x={x} y={node.layout.baselines[index]}>{line || '\u00a0'}</tspan>)}
        </text>;
    } else if (node.type === 'image' || node.type === 'lettering') {
      artwork = node.href && <image href={node.href} x={element.x} y={element.y} width={element.width} height={element.height} preserveAspectRatio="xMidYMid meet" opacity={node.element.opacity} />;
    } else if (node.type === 'decoration') {
      const decoration = node.element;
      artwork = decoration.assetId
        ? node.href && <image href={node.href} x={decoration.x} y={decoration.y} width={decoration.width} height={decoration.height} preserveAspectRatio="xMidYMid meet" opacity={decoration.opacity} />
        : <g opacity={decoration.opacity} fill={decoration.fill || 'none'} stroke={decoration.stroke || 'none'} strokeWidth={ptToMm(decoration.strokeWidth)}>
          {decoration.shape === 'circle' ? <path d={pathToSvg(ellipsePath(decoration.x + decoration.width / 2, decoration.y + decoration.height / 2, decoration.width / 2, decoration.height / 2))} /> : decoration.shape === 'line' ? <line x1={decoration.x} y1={decoration.y + decoration.height / 2} x2={decoration.x + decoration.width} y2={decoration.y + decoration.height / 2} /> : <polygon points={starPoints(decoration, decoration.points).map(pair => pair.join(',')).join(' ')} />}
        </g>;
    }
    return <g key={node.id} clipPath={node.clipToShape ? `url(#${prefix}-clip)` : undefined}>
      <g data-element={node.elementKind} data-element-id={scene.product === 'postcards' ? node.id : undefined} data-decoration-id={node.type === 'decoration' ? node.id : undefined} transform={transform}>
        {artwork}
        {!print && <rect x={element.x} y={element.y} width={element.width} height={element.height} fill="transparent" />}
      </g>
    </g>;
  };

  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${scene.width} ${scene.height}`} width="100%" height="100%" overflow="visible" role="img" aria-label={scene.label}>
    <defs>
      <clipPath id={`${prefix}-clip`}><path d={scene.shape} /></clipPath>
      {scene.hole && <mask id={`${prefix}-hole`} maskUnits="userSpaceOnUse" x={maskLeft} y={maskTop} width={maskRight - maskLeft} height={maskBottom - maskTop}>
        <rect x={maskLeft} y={maskTop} width={maskRight - maskLeft} height={maskBottom - maskTop} fill="white" />
        <circle cx={scene.hole.x} cy={scene.hole.y} r={scene.hole.diameter / 2} fill="black" />
      </mask>}
      {background.kind === 'linear' ? <linearGradient id={`${prefix}-gradient`} x1={`${(0.5 - dx) * 100}%`} y1={`${(0.5 - dy) * 100}%`} x2={`${(0.5 + dx) * 100}%`} y2={`${(0.5 + dy) * 100}%`}>
        {background.colors.map((color, index, colors) => <stop key={index} offset={`${index / Math.max(1, colors.length - 1) * 100}%`} stopColor={color} />)}
      </linearGradient> : background.kind === 'radial' ? <radialGradient id={`${prefix}-gradient`} cx={`${background.centerX * 100}%`} cy={`${background.centerY * 100}%`} r="70%">
        {background.colors.map((color, index, colors) => <stop key={index} offset={`${index / Math.max(1, colors.length - 1) * 100}%`} stopColor={color} />)}
      </radialGradient> : null}
      {scene.nodes.map(node => {
        if (node.type !== 'text' || !node.element.shadow) return null;
        const { shadow, stroke } = node.element;
        const paddingX = shadow.blur * 3 + Math.abs(shadow.offsetX) + ptToMm(stroke?.width ?? 0) + scene.width;
        const paddingY = shadow.blur * 3 + Math.abs(shadow.offsetY) + ptToMm(stroke?.width ?? 0) + scene.height;
        return <filter key={node.id} id={`${prefix}-shadow-${node.id}`} filterUnits="userSpaceOnUse" x={node.element.x - paddingX} y={node.element.y - paddingY} width={node.element.width + paddingX * 2} height={Math.max(node.element.height, node.layout.height) + paddingY * 2} colorInterpolationFilters="sRGB"><feDropShadow dx={shadow.offsetX} dy={shadow.offsetY} stdDeviation={shadow.blur} floodColor={shadow.color} /></filter>;
      })}
    </defs>
    <g mask={scene.hole ? `url(#${prefix}-hole)` : undefined}>
      <g clipPath={`url(#${prefix}-clip)`}>
        <path d={scene.shape} fill={fill || '#ffffff'} data-element="card" />
        {scene.backgroundImage?.href && <image href={scene.backgroundImage.href} x="0" y="0" width={scene.width} height={scene.height} preserveAspectRatio="xMidYMid slice" />}
      </g>
      {scene.nodes.map(renderNode)}
    </g>
    {scene.hole && !print && <circle data-element="hole" cx={scene.hole.x} cy={scene.hole.y} r={scene.hole.diameter / 2} fill="transparent" stroke="#a78c6d" strokeWidth="0.15" />}
    {print && scene.product === 'tags' && <g fill="none" stroke="#b8b8b8" strokeWidth="0.15" strokeDasharray="0.8 0.6"><path d={scene.shape} />{scene.hole && <circle cx={scene.hole.x} cy={scene.hole.y} r={scene.hole.diameter / 2} />}</g>}
  </svg>;
}
