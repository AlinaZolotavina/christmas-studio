import { useId } from 'react';
import type { Card } from '../domain/types';
import { ptToMm } from '../domain/types';
import { ellipsePath, holeDiameter, pathToSvg, shapePath, starPoints } from '../domain/geometry';
import { assetUrl, assets } from '../content/assets';
import { FONT_FAMILIES, layoutText } from './text';

export interface CardSvgProps { card: Card; className?: string; idPrefix?: string; print?: boolean }

export function CardSvg({ card, className, idPrefix, print = false }: CardSvgProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const prefix = `${idPrefix || reactId}-${card.id}`.replace(/[^a-zA-Z0-9-]/g, '');
  const shape = shapePath(card);
  const text = layoutText(card.text);
  const image = assets.find(asset => asset.id === card.illustration.assetId);
  const fill = card.background.kind === 'solid' ? card.background.colors[0] : `url(#${prefix}-gradient)`;
  const angle = card.background.angle * Math.PI / 180;
  const dx = Math.cos(angle) / 2;
  const dy = Math.sin(angle) / 2;
  const textX = card.text.align === 'center' ? card.text.x + card.text.width / 2 : card.text.align === 'right' ? card.text.x + card.text.width : card.text.x;
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${card.width} ${card.height}`} width="100%" height="100%" overflow="visible" role="img" aria-label={`Карточка ${card.number}`}>
    <defs>
      <clipPath id={`${prefix}-clip`}><path d={shape} /></clipPath>
      <mask id={`${prefix}-hole`} maskUnits="userSpaceOnUse" x={-card.width} y={-card.height} width={card.width * 3} height={card.height * 3}>
        <rect x={-card.width} y={-card.height} width={card.width * 3} height={card.height * 3} fill="white" />
        {card.hole && <circle cx={card.hole.x} cy={card.hole.y} r={holeDiameter(card) / 2} fill="black" />}
      </mask>
      {card.background.kind === 'linear' ? <linearGradient id={`${prefix}-gradient`} x1={`${(0.5 - dx) * 100}%`} y1={`${(0.5 - dy) * 100}%`} x2={`${(0.5 + dx) * 100}%`} y2={`${(0.5 + dy) * 100}%`}>
        {card.background.colors.map((color, index, colors) => <stop key={index} offset={`${index / Math.max(1, colors.length - 1) * 100}%`} stopColor={color} />)}
      </linearGradient> : <radialGradient id={`${prefix}-gradient`} cx={`${card.background.centerX * 100}%`} cy={`${card.background.centerY * 100}%`} r="70%">
        {card.background.colors.map((color, index, colors) => <stop key={index} offset={`${index / Math.max(1, colors.length - 1) * 100}%`} stopColor={color} />)}
      </radialGradient>}
    </defs>
    <g mask={`url(#${prefix}-hole)`}>
      <g clipPath={`url(#${prefix}-clip)`}>
      <path d={shape} fill={fill || '#fff9ee'} data-element="card" />
      {card.decorations.map(decoration => <g key={decoration.id} data-element="decoration" data-decoration-id={decoration.id}>
        {decoration.type === 'circle' ? <path d={pathToSvg(ellipsePath(decoration.x + decoration.width / 2, decoration.y + decoration.height / 2, decoration.width / 2, decoration.height / 2))} fill={decoration.fill || 'none'} stroke={decoration.stroke || 'none'} strokeWidth={ptToMm(decoration.strokeWidth)} /> : <polygon points={starPoints(decoration, decoration.points).map(pair => pair.join(',')).join(' ')} fill={decoration.fill || 'none'} stroke={decoration.stroke || 'none'} strokeWidth={ptToMm(decoration.strokeWidth)} />}
        {!print && <rect x={decoration.x} y={decoration.y} width={decoration.width} height={decoration.height} fill="transparent" />}
      </g>)}
      <g data-element="illustration" transform={`rotate(${card.illustration.rotation} ${card.illustration.x + card.illustration.width / 2} ${card.illustration.y + card.illustration.height / 2})`}>
        {image && <image href={assetUrl(print ? image.print : image.preview)} x={card.illustration.x} y={card.illustration.y} width={card.illustration.width} height={card.illustration.height} preserveAspectRatio="xMidYMid meet" />}
        {!print && <rect x={card.illustration.x} y={card.illustration.y} width={card.illustration.width} height={card.illustration.height} fill="transparent" />}
      </g>
      </g>
      <g data-element="text">
        <text fill={card.text.color} fontFamily={FONT_FAMILIES[card.text.fontId] || FONT_FAMILIES.sans} fontSize={ptToMm(card.text.fontSize)} fontWeight={card.text.weight} fontStyle={card.text.italic ? 'italic' : 'normal'} textAnchor={card.text.align === 'center' ? 'middle' : card.text.align === 'right' ? 'end' : 'start'} xmlSpace="preserve">
          {text.lines.map((line, i) => <tspan key={i} x={textX} y={text.baselines[i]}>{line || '\u00a0'}</tspan>)}
        </text>
        {!print && <rect x={card.text.x} y={card.text.y} width={card.text.width} height={card.text.height} fill="transparent" />}
      </g>
    </g>
    {card.hole && !print && <circle data-element="hole" cx={card.hole.x} cy={card.hole.y} r={holeDiameter(card) / 2} fill="transparent" stroke="#a78c6d" strokeWidth="0.15" />}
    {print && <path d={shape} fill="none" stroke="#b8b8b8" strokeWidth="0.15" strokeDasharray="0.8 0.6" />}
  </svg>;
}

export default CardSvg;
