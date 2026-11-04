import { useEffect, useReducer } from 'react';
import type { Postcard } from '../domain/postcards/types';
import { createPostcardScene } from './scene';
import { preparePostcardFonts, subscribePostcardFonts } from './postcard-fonts';
import { SceneSvg } from './SceneSvg';

export interface PostcardSvgProps { postcard: Postcard; className?: string; idPrefix?: string; print?: boolean; quality?: 'preview' | 'print'; textPaths?: Record<string, string> }

export function PostcardSvg({ postcard, quality = 'preview', ...props }: PostcardSvgProps) {
  const [, refresh] = useReducer(value => value + 1, 0);
  const fontRequests = postcard.elements.filter(element => element.type === 'text').map(element => `${element.fontId}/${element.weight}/${element.italic}`).sort().join('|');
  useEffect(() => subscribePostcardFonts(refresh), []);
  useEffect(() => {
    let active = true;
    void preparePostcardFonts([postcard]).then(() => { if (active) refresh(); }).catch(() => { if (active) refresh(); });
    return () => { active = false; };
    // Font loading depends on requested faces, not on drag positions or content.
  }, [fontRequests]);
  return <SceneSvg {...props} scene={createPostcardScene(postcard, { quality })} />;
}

export default PostcardSvg;
