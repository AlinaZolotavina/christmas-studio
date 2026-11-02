import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import sharp from 'sharp';

// Read the explicit registry: this script never guesses metadata from filenames.
const source = await fs.readFile('src/data/images.ts', 'utf8');
const moduleSource = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { images, categories, subcategories } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
const ids = new Set();
const sources = new Set();
const files = (await fs.readdir('assets')).filter(name => /\.png$/i.test(name));
const invalidNames = files.filter(name => !/^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/.test(name));
if (invalidNames.length) throw new Error(`Use English kebab-case PNG filenames: ${invalidNames.join(', ')}`);
if (new Set(categories.map(item => item.id)).size !== categories.length || new Set(subcategories.map(item => item.id)).size !== subcategories.length) throw new Error('Duplicate category or motif ID');
for (const motif of subcategories) if (!categories.some(category => category.id === motif.category)) throw new Error(`Unknown parent category: ${motif.id}`);
for (const image of images) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(image.id) || ids.has(image.id)) throw new Error(`Invalid/duplicate ID: ${image.id}`);
  if (sources.has(image.source)) throw new Error(`Duplicate source: ${image.source}`);
  if (!categories.some(c => c.id === image.category) || !subcategories.some(c => c.id === image.subcategory && c.category === image.category)) throw new Error(`Invalid taxonomy: ${image.id}`);
  if (image.source !== `assets/${image.id}.png` || image.src !== `art/${image.id}.png`) throw new Error(`Match source and src filenames to the explicit image ID: ${image.id}`);
  if (!files.includes(`${image.id}.png`)) throw new Error(`Missing source: ${image.source}`);
  ids.add(image.id); sources.add(image.source);
}
const missing = files.filter(name => !sources.has(`assets/${name}`));
if (missing.length) throw new Error(`Add explicit metadata to src/data/images.ts for: ${missing.join(', ')}`);
await fs.mkdir('public/art', { recursive: true });
await fs.mkdir('src/content', { recursive: true });
const dimensions = {};
for (const image of images) {
  const input = sharp(image.source);
  const { width, height } = await input.metadata();
  dimensions[image.id] = { width, height };
  const output = path.join('public', image.src);
  await fs.mkdir(path.dirname(output), { recursive: true });
  // Preserve full-resolution PNG originals for print; only previews are resized.
  await fs.copyFile(image.source, output);
  await input.resize(360, 420, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(`public/art/${image.id}-preview.webp`);
}
await fs.writeFile('src/content/image-dimensions.json', `${JSON.stringify(dimensions, null, 2)}\n`);
console.log(`Prepared ${images.length} explicitly catalogued images and previews.`);

// User-supplied page artwork is optimized separately and never enters the editor library.
const pageSource = await fs.readFile('src/data/site-art.ts', 'utf8');
const pageModule = ts.transpileModule(pageSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { pageArtwork } = await import(`data:text/javascript;base64,${Buffer.from(pageModule).toString('base64')}`);
await fs.mkdir('public/site', { recursive: true });
for (const artwork of pageArtwork) {
  await sharp(artwork.source).resize(1536, 1024, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join('public', artwork.src));
}
console.log(`Prepared ${pageArtwork.length} page illustrations.`);
