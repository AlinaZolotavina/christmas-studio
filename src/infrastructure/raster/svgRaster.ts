import { t } from '../../i18n';
/** Render a self-contained scene at the requested pixel dimensions, then release it. */
export async function rasterizeSvg(svg: string, width: number, height: number, format: 'png' | 'jpg' = 'png', opaque = true, signal?: AbortSignal): Promise<Uint8Array> {
    if (typeof document === 'undefined')
        throw new Error(t("errors.raster.browserOnly"));
    signal?.throwIfAborted();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    try {
        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error(t("errors.raster.preparationFailed")));
            image.src = url;
        });
        signal?.throwIfAborted();
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error(t("errors.raster.renderingFailed"));
        if (opaque) {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, width, height);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error(t("errors.raster.insufficientMemory"))), format === 'jpg' ? 'image/jpeg' : 'image/png', 0.96));
        signal?.throwIfAborted();
        return new Uint8Array(await blob.arrayBuffer());
    }
    finally {
        image.onload = null;
        image.onerror = null;
        image.src = '';
        URL.revokeObjectURL(url);
        canvas.width = 0;
        canvas.height = 0;
    }
}
