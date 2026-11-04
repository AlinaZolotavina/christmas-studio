import { useEffect, useReducer } from 'react';
import type { Card } from '../domain/types';
import { createTagScene } from './scene';
import { SceneSvg } from './SceneSvg';

export interface CardSvgProps { card: Card; className?: string; idPrefix?: string; print?: boolean; quality?: 'preview' | 'print' }

export function CardSvg({ card, className, idPrefix, print = false, quality }: CardSvgProps) {
  const [, refresh] = useReducer(value => value + 1, 0);
  useEffect(() => {
    let active = true;
    const loaded = () => { if (active) refresh(); };
    void document.fonts?.ready.then(loaded);
    document.fonts?.addEventListener('loadingdone', loaded);
    return () => { active = false; document.fonts?.removeEventListener('loadingdone', loaded); };
  }, []);
  return <SceneSvg className={className} idPrefix={idPrefix} print={print} scene={createTagScene(card, quality || (print ? 'print' : 'preview'))} />;
}

export default CardSvg;
