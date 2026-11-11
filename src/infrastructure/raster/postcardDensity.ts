import { t } from '../../i18n';
export const POSTCARD_DPI = 300;
export function postcardPixelSize(widthMm: number, heightMm: number) {
    return { width: Math.round(widthMm * POSTCARD_DPI / 25.4), height: Math.round(heightMm * POSTCARD_DPI / 25.4) };
}
function crc32(bytes: Uint8Array): number {
    let crc = 0xffffffff;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++)
            crc = crc >>> 1 ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
function concatenate(parts: Uint8Array[]): Uint8Array {
    const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
    let offset = 0;
    for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
    }
    return result;
}
/** Browsers encode canvas images at 96 DPI; write the physical density explicitly. */
export function withPngDensity(bytes: Uint8Array, dpi = POSTCARD_DPI): Uint8Array {
    if (bytes.length < 33 || ![137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => bytes[i] === byte))
        throw new Error(t("errors.raster.invalidPng"));
    const density = new Uint8Array(21);
    const view = new DataView(density.buffer);
    view.setUint32(0, 9);
    density.set([112, 72, 89, 115], 4); // pHYs
    view.setUint32(8, Math.round(dpi / 0.0254));
    view.setUint32(12, Math.round(dpi / 0.0254));
    density[16] = 1;
    view.setUint32(17, crc32(density.subarray(4, 17)));
    const chunks: Uint8Array[] = [bytes.subarray(0, 8)];
    let inserted = false;
    const input = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let offset = 8; offset < bytes.length;) {
        if (offset + 12 > bytes.length)
            throw new Error(t("errors.raster.pngStructure"));
        const length = input.getUint32(offset);
        const end = offset + length + 12;
        if (end > bytes.length)
            throw new Error(t("errors.raster.pngStructure"));
        const name = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
        if (name === 'IDAT' && !inserted) {
            chunks.push(density);
            inserted = true;
        }
        if (name !== 'pHYs')
            chunks.push(bytes.subarray(offset, end));
        offset = end;
    }
    if (!inserted)
        throw new Error(t("errors.raster.pngData"));
    return concatenate(chunks);
}
export function withJpegDensity(bytes: Uint8Array, dpi = POSTCARD_DPI): Uint8Array {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8)
        throw new Error(t("errors.raster.invalidJpg"));
    const result = bytes.slice();
    const view = new DataView(result.buffer);
    for (let offset = 2; offset + 4 <= result.length;) {
        if (result[offset] !== 0xff)
            break;
        const marker = result[offset + 1];
        if (marker === 0xda || marker === 0xd9)
            break;
        if (marker === 0x00 || marker === 0xff || marker >= 0xd0 && marker <= 0xd7) {
            offset += 2;
            continue;
        }
        const length = view.getUint16(offset + 2);
        if (length < 2 || offset + 2 + length > result.length)
            throw new Error(t("errors.raster.jpgStructure"));
        if (marker === 0xe0 && length >= 16 && String.fromCharCode(...result.subarray(offset + 4, offset + 9)) === 'JFIF\0') {
            result[offset + 11] = 1;
            view.setUint16(offset + 12, dpi);
            view.setUint16(offset + 14, dpi);
            return result;
        }
        offset += 2 + length;
    }
    const jfif = new Uint8Array([0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1, 2, 1, dpi >>> 8, dpi & 255, dpi >>> 8, dpi & 255, 0, 0]);
    return concatenate([result.subarray(0, 2), jfif, result.subarray(2)]);
}
