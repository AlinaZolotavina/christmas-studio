import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import sharp from 'sharp';
import { createHash } from 'node:crypto';

// Read explicit registries: semantic metadata is never guessed from filenames.
async function readRegistry(filename) {
  const source = await fs.readFile(filename, 'utf8');
  const moduleSource = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
}

const [illustrationRegistry, letteringRegistry, backgroundRegistry, decorationRegistry, siteRegistry] = await Promise.all([
  readRegistry('src/data/images.ts'),
  readRegistry('src/data/lettering.ts'),
  readRegistry('src/data/backgrounds.ts'),
  readRegistry('src/data/decorations.ts'),
  readRegistry('src/data/site-art.ts'),
]);
const catalogs = [
  {
    records: illustrationRegistry.images, categories: illustrationRegistry.categories, motifs: illustrationRegistry.motifs,
    registry: 'src/data/images.ts', sourceDir: 'original-assets', outputDir: 'art', dimensionsFile: 'image-dimensions.json', label: 'illustrations',
  },
  {
    records: letteringRegistry.lettering, categories: letteringRegistry.letteringCategories, motifs: letteringRegistry.letteringMotifs,
    registry: 'src/data/lettering.ts', sourceDir: 'original-assets/lettering', outputDir: 'lettering', dimensionsFile: 'lettering-dimensions.json', label: 'lettering images',
  },
  {
    records: backgroundRegistry.backgrounds, categories: backgroundRegistry.backgroundCategories, motifs: backgroundRegistry.backgroundMotifs,
    registry: 'src/data/backgrounds.ts', sourceDir: 'original-assets/backgrounds', outputDir: 'backgrounds', dimensionsFile: 'background-dimensions.json', label: 'backgrounds',
  },
  {
    records: decorationRegistry.decorations, categories: decorationRegistry.decorationCategories, motifs: decorationRegistry.decorationMotifs,
    registry: 'src/data/decorations.ts', sourceDir: 'original-assets/decorations', outputDir: 'decorations', dimensionsFile: 'decoration-dimensions.json', label: 'decorations',
  },
];

async function validateCatalog(catalog) {
  const { records, categories, motifs, registry, sourceDir, outputDir } = catalog;
  const ids = new Set();
  const sources = new Set();
  const files = (await fs.readdir(sourceDir)).filter(name => /\.(png|svg)$/i.test(name));
  const invalidNames = files.filter(name => !/^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|svg)$/.test(name));
  if (invalidNames.length) throw new Error(`Use English kebab-case PNG/SVG filenames in ${sourceDir}: ${invalidNames.join(', ')}`);
  if (new Set(categories.map(item => item.id)).size !== categories.length || new Set(motifs.map(item => item.id)).size !== motifs.length) throw new Error(`Duplicate category or motif ID in ${registry}`);
  for (const motif of motifs) if (!categories.some(category => category.id === motif.category)) throw new Error(`Unknown parent category: ${motif.id}`);
  for (const image of records) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(image.id) || ids.has(image.id)) throw new Error(`Invalid/duplicate ID in ${registry}: ${image.id}`);
    if (sources.has(image.source)) throw new Error(`Duplicate source: ${image.source}`);
    if (!categories.some(c => c.id === image.category) || !motifs.some(c => c.id === image.subcategory && c.category === image.category)) throw new Error(`Invalid taxonomy: ${image.id}`);
    const extension = path.extname(image.source);
    const preparedExtension = extension === '.svg' ? '.svg' : '.webp';
    if (!['.png', '.svg'].includes(extension) || image.source !== `${sourceDir}/${image.id}${extension}` || image.src !== `${outputDir}/${image.id}${preparedExtension}`) throw new Error(`Match source and src filenames to the explicit image ID: ${image.id}`);
    if (!files.includes(`${image.id}${extension}`)) throw new Error(`Missing source: ${image.source}`);
    if (!image.name.ru || !image.name.en || !image.tags.length || !image.tagsEn.length) throw new Error(`Missing bilingual metadata: ${image.id}`);
    ids.add(image.id); sources.add(image.source);
  }
  const missing = files.filter(name => !sources.has(`${sourceDir}/${name}`));
  if (missing.length) throw new Error(`Add explicit metadata to ${registry} for: ${missing.join(', ')}`);
}

// This explicit local command needs originals; dev, build and CI never run it.
await fs.access('original-assets').catch(() => { throw new Error('Add local originals to original-assets before running assets:prepare. Regular builds use the committed assets folder.'); });
const cacheFile = 'original-assets/.prepared-assets-cache.json';
const cache = await fs.readFile(cacheFile, 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return {}; throw error; });
async function prepareCached(source, outputs, recipe, prepare) {
  const hash = createHash('sha256').update(await fs.readFile(source)).update(recipe).update(sharp.versions.vips).digest('hex');
  if (cache[source] === hash && (await Promise.all(outputs.map(file => fs.access(file).then(() => true, () => false)))).every(Boolean)) return false;
  await prepare();
  cache[source] = hash;
  return true;
}

// Validate every collection before producing files, including future postcard materials.
for (const catalog of catalogs) await validateCatalog(catalog);
// Compare decoded pixels rather than PNG metadata or filenames. Transparent RGB is invisible.
const sourceFingerprints = new Map();
for (const catalog of catalogs) for (const image of catalog.records) {
  const { data, info } = await sharp(image.source).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) if (data[offset + 3] === 0) data.fill(0, offset, offset + 3);
  const fingerprint = createHash('sha256').update(`${info.width}x${info.height}:`).update(data).digest('hex');
  const duplicate = sourceFingerprints.get(fingerprint);
  if (duplicate) throw new Error(`Duplicate artwork: ${image.source} has the same pixels as ${duplicate}. Reuse its existing ID.`);
  sourceFingerprints.set(fingerprint, image.source);
}
await fs.mkdir('src/content', { recursive: true });
for (const catalog of catalogs) {
  await fs.mkdir(path.join('assets', catalog.outputDir), { recursive: true });
  const dimensions = {};
  let cursor = 0, prepared = 0, finished = 0;
  await Promise.all(Array.from({ length: Math.min(3, catalog.records.length) }, async () => {
    while (cursor < catalog.records.length) {
      const image = catalog.records[cursor++];
      const { width, height } = await sharp(image.source).metadata();
      dimensions[image.id] = { width, height };
      const output = path.join('assets', image.src);
      const preview = `assets/${catalog.outputDir}/${image.id}-preview.webp`;
      const svg = image.source.endsWith('.svg');
      const options = catalog.outputDir === 'lettering' ? { lossless: true, effort: 4 } : { quality: 92, alphaQuality: 100, smartSubsample: true, effort: 4 };
      if (await prepareCached(image.source, [output, preview], JSON.stringify({ options, svg, preview: '360x420-q84-v1' }), async () => {
        if (svg) await fs.copyFile(image.source, output);
        else await sharp(image.source).webp(options).toFile(output);
        await sharp(image.source).resize(360, 420, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(preview);
      })) prepared++;
      if (++finished % 20 === 0) console.log(`${catalog.label}: ${finished}/${catalog.records.length}`);
    }
  }));
  // Preserve registry order regardless of which compression worker finishes first.
  const orderedDimensions = Object.fromEntries(catalog.records.map(image => [image.id, dimensions[image.id]]));
  await fs.writeFile(`src/content/${catalog.dimensionsFile}`, `${JSON.stringify(orderedDimensions, null, 2)}\n`);
  await fs.writeFile(cacheFile, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`Prepared ${prepared} ${catalog.label}; reused ${catalog.records.length - prepared} unchanged files.`);
}

// User-supplied page artwork is optimized separately and never enters the editor library.
const { pageArtwork, brandArtwork } = siteRegistry;
await fs.mkdir('assets/site', { recursive: true });
for (const artwork of pageArtwork) {
  const output = path.join('assets', artwork.src);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await prepareCached(artwork.source, [output], 'site-1536x1024-q86-v1', async () => {
    if (path.extname(artwork.source).toLowerCase() === '.svg') await fs.copyFile(artwork.source, output);
    else await sharp(artwork.source).resize(1536, 1024, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toFile(output);
  });
}
await fs.copyFile(brandArtwork.source, 'assets/favicon.svg');
await fs.writeFile(cacheFile, `${JSON.stringify(cache, null, 2)}\n`);
console.log(`Prepared ${pageArtwork.length} page assets.`);
