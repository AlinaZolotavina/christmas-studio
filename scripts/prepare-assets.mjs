import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import sharp from 'sharp';

// Read explicit registries: semantic metadata is never guessed from filenames.
async function readRegistry(filename) {
  const source = await fs.readFile(filename, 'utf8');
  const moduleSource = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
}

const [illustrationRegistry, letteringRegistry, backgroundRegistry, siteRegistry] = await Promise.all([
  readRegistry('src/data/images.ts'),
  readRegistry('src/data/lettering.ts'),
  readRegistry('src/data/backgrounds.ts'),
  readRegistry('src/data/site-art.ts'),
]);
const catalogs = [
  {
    records: illustrationRegistry.images, categories: illustrationRegistry.categories, motifs: illustrationRegistry.motifs,
    registry: 'src/data/images.ts', sourceDir: 'assets', outputDir: 'art', dimensionsFile: 'image-dimensions.json', label: 'illustrations',
  },
  {
    records: letteringRegistry.lettering, categories: letteringRegistry.letteringCategories, motifs: letteringRegistry.letteringMotifs,
    registry: 'src/data/lettering.ts', sourceDir: 'assets/lettering', outputDir: 'lettering', dimensionsFile: 'lettering-dimensions.json', label: 'lettering images',
  },
  {
    records: backgroundRegistry.backgrounds, categories: backgroundRegistry.backgroundCategories, motifs: backgroundRegistry.backgroundMotifs,
    registry: 'src/data/backgrounds.ts', sourceDir: 'assets/backgrounds', outputDir: 'backgrounds', dimensionsFile: 'background-dimensions.json', label: 'backgrounds',
  },
];

async function validateCatalog(catalog) {
  const { records, categories, motifs, registry, sourceDir, outputDir } = catalog;
  const ids = new Set();
  const sources = new Set();
  const files = (await fs.readdir(sourceDir)).filter(name => /\.png$/i.test(name));
  const invalidNames = files.filter(name => !/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(name));
  if (invalidNames.length) throw new Error(`Use English kebab-case PNG filenames in ${sourceDir}: ${invalidNames.join(', ')}`);
  if (new Set(categories.map(item => item.id)).size !== categories.length || new Set(motifs.map(item => item.id)).size !== motifs.length) throw new Error(`Duplicate category or motif ID in ${registry}`);
  for (const motif of motifs) if (!categories.some(category => category.id === motif.category)) throw new Error(`Unknown parent category: ${motif.id}`);
  for (const image of records) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(image.id) || ids.has(image.id)) throw new Error(`Invalid/duplicate ID in ${registry}: ${image.id}`);
    if (sources.has(image.source)) throw new Error(`Duplicate source: ${image.source}`);
    if (!categories.some(c => c.id === image.category) || !motifs.some(c => c.id === image.subcategory && c.category === image.category)) throw new Error(`Invalid taxonomy: ${image.id}`);
    if (image.source !== `${sourceDir}/${image.id}.png` || image.src !== `${outputDir}/${image.id}.png`) throw new Error(`Match source and src filenames to the explicit image ID: ${image.id}`);
    if (!files.includes(`${image.id}.png`)) throw new Error(`Missing source: ${image.source}`);
    if (!image.name.ru || !image.name.en || !image.tags.length || !image.tagsEn.length) throw new Error(`Missing bilingual metadata: ${image.id}`);
    ids.add(image.id); sources.add(image.source);
  }
  const missing = files.filter(name => !sources.has(`${sourceDir}/${name}`));
  if (missing.length) throw new Error(`Add explicit metadata to ${registry} for: ${missing.join(', ')}`);
}

// Validate every collection before producing files, including future postcard materials.
for (const catalog of catalogs) await validateCatalog(catalog);
await fs.mkdir('src/content', { recursive: true });
for (const catalog of catalogs) {
  await fs.mkdir(path.join('public', catalog.outputDir), { recursive: true });
  const dimensions = {};
  for (const image of catalog.records) {
    const input = sharp(image.source);
    const { width, height } = await input.metadata();
    dimensions[image.id] = { width, height };
    // Preserve full-resolution PNG originals for print; only previews are resized.
    await fs.copyFile(image.source, path.join('public', image.src));
    await input.resize(360, 420, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(`public/${catalog.outputDir}/${image.id}-preview.webp`);
  }
  await fs.writeFile(`src/content/${catalog.dimensionsFile}`, `${JSON.stringify(dimensions, null, 2)}\n`);
  console.log(`Prepared ${catalog.records.length} ${catalog.label} and previews.`);
}

// User-supplied page artwork is optimized separately and never enters the editor library.
const { pageArtwork, brandArtwork } = siteRegistry;
await fs.mkdir('public/site', { recursive: true });
for (const artwork of pageArtwork) {
  const output = path.join('public', artwork.src);
  await fs.mkdir(path.dirname(output), { recursive: true });
  if (path.extname(artwork.source).toLowerCase() === '.svg') await fs.copyFile(artwork.source, output);
  else await sharp(artwork.source).resize(1536, 1024, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toFile(output);
}
await fs.copyFile(brandArtwork.source, 'public/favicon.svg');
console.log(`Prepared ${pageArtwork.length} page assets.`);
