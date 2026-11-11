import { cloneElement, Fragment, type ReactElement, type ReactNode } from 'react';
import { message, type MessageKey } from './index';

/** Translations can arrange supplied React components, but cannot inject HTML or attributes. */
export function rich(key: MessageKey, params: Record<string, ReactNode> = {}, components: Record<string, ReactElement> = {}): ReactNode {
  const source = message(key, params);
  const token = /\{([A-Za-z]\w*)\}|<(\/?)([A-Za-z]\w*)(\/?)>/g;
  const root: ReactNode[] = [];
  const stack: { name: string; children: ReactNode[] }[] = [{ name: '', children: root }];
  let cursor = 0, serial = 0;
  for (const match of source.matchAll(token)) {
    const current = stack.at(-1)!;
    current.children.push(source.slice(cursor, match.index));
    cursor = match.index! + match[0].length;
    const [, parameter, closing, name, selfClosing] = match;
    if (parameter) {
      if (!Object.hasOwn(params, parameter)) throw new Error(`Missing translation parameter ${parameter} in ${key}`);
      current.children.push(<Fragment key={`param-${serial++}`}>{params[parameter]}</Fragment>);
    } else if (closing) {
      if (stack.length === 1 || current.name !== name) throw new Error(`Unbalanced translation markup in ${key}`);
      stack.pop();
      stack.at(-1)!.children.push(cloneElement(components[name], { key: `markup-${serial++}` }, ...current.children));
    } else {
      if (!Object.hasOwn(components, name)) throw new Error(`Unknown translation component ${name} in ${key}`);
      if (selfClosing) current.children.push(cloneElement(components[name], { key: `markup-${serial++}` }));
      else stack.push({ name, children: [] });
    }
  }
  stack.at(-1)!.children.push(source.slice(cursor));
  if (stack.length !== 1) throw new Error(`Unclosed translation markup in ${key}`);
  return <>{root}</>;
}
