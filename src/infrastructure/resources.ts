import { assetUrl } from '../content/assets';

const byteCache = new Map<string, Promise<Uint8Array>>();

/** Shared local-resource lifecycle for both print products; failed requests can retry. */
export async function loadLocalResourceBytes(path: string): Promise<Uint8Array> {
  if (!byteCache.has(path)) {
    const request = fetch(assetUrl(path)).then(async response => {
      if (!response.ok) throw new Error(`Не удалось загрузить ресурс для печати: ${path}`);
      return new Uint8Array(await response.arrayBuffer());
    }).catch(reason => { byteCache.delete(path); throw reason; });
    byteCache.set(path, request);
  }
  return byteCache.get(path)!;
}

export const releaseLocalResourceBytes = (path: string) => { byteCache.delete(path); };
