import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { rich } from './rich';

describe('rich translations', () => {
  it('renders plural text inside the supplied components', () => {
    const markup = renderToStaticMarkup(<>{rich('pages.tags.cardCount', { count: 31 }, { strong: <strong />, span: <span /> })}</>);
    expect(markup).toBe('<strong>31</strong><span>карточка</span>');
  });
  it('keeps user values as text rather than HTML or translation markup', () => {
    const markup = renderToStaticMarkup(<>{rich('projects.resume.description', { projectName: '<script>{count}</script>' })}</>);
    expect(markup).toContain('&lt;script&gt;{count}&lt;/script&gt;');
    expect(markup).not.toContain('<script>');
  });
  it('requires the caller to provide each component used by a message', () => {
    expect(() => rich('pages.tags.cardCount', { count: 1 }, {})).toThrow('Unknown translation component');
  });
});
