import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { IdeasPage } from './IdeasPage';

describe('Ideas landing page', () => {
  it('keeps the gift ideas card first and before the tag ideas card', () => {
    const html = renderToStaticMarkup(createElement(IdeasPage, { hasProject: false }));
    const giftsIndex = html.indexOf('Идеи для подарков');
    const tagsIndex = html.indexOf('Крепление адвент-тегов');

    expect(giftsIndex).toBeGreaterThan(-1);
    expect(tagsIndex).toBeGreaterThan(giftsIndex);
  });
});
