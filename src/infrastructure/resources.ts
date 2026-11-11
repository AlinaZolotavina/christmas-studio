import { t } from '../i18n';
import { assetUrl } from '../content/assets';
const byteCache = new Map<string, Promise<Uint8Array>>();
/** Keep the PNG export contract without introducing another lossy encoding step. */
async function webpToPng(bytes: Uint8Array): Promise<Uint8Array> {
    const blob = new Blob([bytes.slice().buffer], { type: 'image/webp' });
    let objectUrl: string | undefined;
    let bitmap: ImageBitmap | HTMLImageElement | undefined;
    let canvas: HTMLCanvasElement | undefined;
    try {
        bitmap = typeof createImageBitmap === 'function'
            ? await createImageBitmap(blob)
            : await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                objectUrl = URL.createObjectURL(blob);
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error(t("errors.resources.decodeFailed")));
                image.src = objectUrl;
            });
        canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error(t("errors.resources.prepareFailed"));
        context.drawImage(bitmap, 0, 0);
        const png = await new Promise<Blob>((resolve, reject) => {
            canvas!.toBlob(result => result ? resolve(result) : reject(new Error(t("errors.resources.insufficientMemory"))), 'image/png');
        });
        return new Uint8Array(await png.arrayBuffer());
    }
    finally {
        if (bitmap && 'close' in bitmap)
            bitmap.close();
        if (objectUrl)
            URL.revokeObjectURL(objectUrl);
        if (canvas) {
            canvas.width = 0;
            canvas.height = 0;
        }
    }
}
/** Shared local-resource lifecycle for both print products; failed requests can retry. */
export async function loadLocalResourceBytes(path: string): Promise<Uint8Array> {
    if (!byteCache.has(path)) {
        const url = assetUrl(path);
        const request = fetch(url).then(async (response) => {
            if (!response.ok)
                throw new Error(t("errors.resources.loadFailed", { path: path }));
            const bytes = new Uint8Array(await response.arrayBuffer());
            const isWebp = bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70
                && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80;
            return isWebp ? webpToPng(bytes) : bytes;
        }).catch(reason => { byteCache.delete(path); throw reason; });
        byteCache.set(path, request);
    }
    return byteCache.get(path)!;
}
export const releaseLocalResourceBytes = (path: string) => { byteCache.delete(path); };
