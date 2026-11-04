import { useState } from 'react';
import { ArrowRight, FilePlus2, FolderOpen, Plus } from 'lucide-react';
import { artisticPostcardTemplates, blankPostcardTemplates } from '../../data/postcard-templates';
import { getPostcardSize, type CreatePostcardProjectOptions, type Postcard, type PostcardFormat, type PostcardProject, type PostcardTemplate } from '../../domain/postcards/types';
import { templateHeroArtwork } from '../../data/site-art';
import { assetUrl } from '../../content/assets';
import { PostcardSvg } from '../../rendering/PostcardSvg';
import { SiteLayout } from '../../shared/layout/SiteLayout';
import { BowDivider } from '../../shared/ui/BowDivider';
import { Button, Field } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import '../gallery/template-gallery.css';
import './postcard-gallery.css';

type GalleryMode = 'new' | 'replace' | 'add';
export interface PostcardGalleryProps {
  hasProject: boolean;
  project: PostcardProject | null;
  onContinue: () => void;
  onCreate: (options: CreatePostcardProjectOptions) => void;
  onApply: (template: PostcardTemplate, format: PostcardFormat) => void;
  onAdd: (template: PostcardTemplate, format: PostcardFormat) => void;
}
const formatLabels: Record<PostcardFormat, string> = { 'a6-portrait': 'A6 · вертикальная · 105 × 148 мм', 'a6-landscape': 'A6 · горизонтальная · 148 × 105 мм', square: 'Квадрат · 105 × 105 мм' };
const preview = (template: PostcardTemplate, format = template.format): Postcard => ({ id: `preview-${template.id}`, format, background: template.background, elements: template.elements });

export function PostcardGallery({ hasProject, project, onContinue, onCreate, onApply, onAdd }: PostcardGalleryProps) {
  const [selected, setSelected] = useState<PostcardTemplate | null>(null);
  const [mode, setMode] = useState<GalleryMode>('new');
  const [name, setName] = useState('Мои открытки');
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<PostcardFormat>('a6-portrait');
  const [applyToAll, setApplyToAll] = useState(false);
  const active = project?.postcards.find(card => card.id === project.activePostcardId);
  const choose = (template: PostcardTemplate, action: GalleryMode = project ? 'replace' : 'new') => {
    setSelected(template); setMode(action); setCount(1); setApplyToAll(false);
    setFormat(action === 'replace' && active ? active.format : action === 'add' && project ? project.defaultFormat : template.format);
  };
  const changeMode = (value: GalleryMode) => {
    setMode(value);
    setFormat(value === 'replace' && active ? active.format : value === 'add' && project ? project.defaultFormat : selected?.format ?? 'a6-portrait');
  };
  const submit = () => {
    if (!selected) return;
    if (mode === 'new') {
      if (!Number.isInteger(count) || count < 1 || count > 20 || !name.trim()) return;
      onCreate({ name: name.trim(), count, format, template: selected, applyToAll });
    } else if (mode === 'replace') onApply(selected, format);
    else onAdd(selected, format);
    setSelected(null);
  };
  const templateCard = (template: PostcardTemplate, blank: boolean) => {
    const card = preview(template), size = getPostcardSize(card);
    return <button type="button" key={template.id} className="template-card postcard-start-card" data-postcard-template={template.id} aria-label={`${blank ? 'Начать' : 'Выбрать'}: ${template.name.ru}`} onClick={() => choose(template)}>
      <div className="postcard-start-card__art"><span className="postcard-start-card__paper" style={{ aspectRatio: `${size.width} / ${size.height}` }}><PostcardSvg postcard={card} idPrefix={`catalog-${template.id}`} /></span>{blank && <span className="postcard-start-card__plus" aria-hidden="true"><Plus size={24} /></span>}</div>
      <div className="template-card__details"><div><h3>{template.name.ru}</h3><p>{size.width} × {size.height} мм</p></div><span className="template-card__arrow" aria-hidden="true"><ArrowRight size={20} /></span></div>
    </button>;
  };
  return <SiteLayout current="postcards" hasProject={hasProject}>
    <main className="template-gallery-main postcard-gallery-main">
      <section className="template-hero" aria-labelledby="postcards-title">
        <img src={assetUrl(templateHeroArtwork.left.src)} width={templateHeroArtwork.left.width} height={templateHeroArtwork.left.height} alt="" draggable={false} className="template-hero__scene template-hero__scene--left" />
        <div className="template-hero__copy"><h1 id="postcards-title">Открытки</h1><p>Тёплые слова и зимние истории, которые хочется подарить</p><BowDivider className="postcard-hero-divider" /></div>
        <img src={assetUrl(templateHeroArtwork.right.src)} width={templateHeroArtwork.right.width} height={templateHeroArtwork.right.height} alt="" draggable={false} className="template-hero__scene template-hero__scene--right" />
      </section>
      {project && <section className="postcard-saved-project" aria-label="Сохранённый проект открыток"><div><span className="postcard-saved-project__eyebrow">Ваши открытки сохранены</span><h2>{project.name}</h2><p>Открыток в проекте: {project.postcards.length}</p></div><div className="postcard-saved-project__actions"><Button onClick={onContinue}><FolderOpen size={17} />Продолжить</Button><Button variant="secondary" onClick={() => choose(blankPostcardTemplates[0], 'new')}><FilePlus2 size={17} />Начать новый</Button></div></section>}
      <div className="template-intro"><BowDivider className="template-intro__divider" /><h2 id="postcard-starts-title">Начните с чистой открытки</h2><p className="postcard-gallery-intro">Выберите формат, добавьте текст, иллюстрации и праздничные детали. В одном проекте — от 1 до 20 открыток.</p></div>
      <section className="template-catalog" aria-labelledby="postcard-starts-title"><div className="template-grid">{blankPostcardTemplates.map(template => templateCard(template, true))}</div></section>
      <section className="postcard-artistic-catalog" aria-labelledby="postcard-artistic-title"><h2 id="postcard-artistic-title">Готовые композиции</h2>{artisticPostcardTemplates.length ? <div className="template-grid">{artisticPostcardTemplates.map(template => templateCard(template, false))}</div> : <p>Коллекция пока пуста. Вы можете собрать собственную композицию в редакторе.</p>}</section>
    </main>
    {selected && <Modal title={selected.name.ru} wide className="postcard-create-modal" onClose={() => setSelected(null)} footer={<><Button variant="secondary" onClick={() => setSelected(null)}>Отмена</Button><Button disabled={mode === 'new' && (!name.trim() || !Number.isInteger(count) || count < 1 || count > 20) || mode === 'add' && (project?.postcards.length ?? 0) >= 20} onClick={submit}>{mode === 'new' ? 'Создать проект' : mode === 'replace' ? 'Заменить дизайн' : 'Добавить открытку'}<ArrowRight size={17} /></Button></>}>
      <div className="postcard-create-layout"><div className="postcard-create-preview"><span style={{ aspectRatio: `${getPostcardSize({ format }).width} / ${getPostcardSize({ format }).height}` }}><PostcardSvg postcard={preview(selected, format)} idPrefix="postcard-create-preview" /></span></div><div className="postcard-create-fields">
        {project && <fieldset className="postcard-create-mode"><legend>Действие</legend>{([['new', 'Новый проект'], ['replace', 'Заменить текущую открытку'], ['add', 'Добавить в проект']] as const).map(([value, label]) => <label key={value}><input type="radio" name="postcard-create-mode" value={value} checked={mode === value} onChange={() => changeMode(value)} />{label}</label>)}</fieldset>}
        {mode === 'new' && <><Field label="Название проекта"><input aria-label="Название проекта открыток" maxLength={120} value={name} onChange={event => setName(event.target.value)} /></Field><Field label="Количество открыток" hint="От 1 до 20; позже открытки можно добавлять, копировать и удалять."><input aria-label="Количество открыток" type="number" min={1} max={20} step={1} value={Number.isFinite(count) ? count : ''} onChange={event => setCount(event.target.valueAsNumber)} /></Field></>}
        <Field label={mode === 'new' ? 'Формат по умолчанию' : 'Формат открытки'}><select aria-label="Формат открытки" value={format} onChange={event => setFormat(event.target.value as PostcardFormat)}>{Object.entries(formatLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        {mode === 'new' && <Field label="Применить стартовый дизайн"><select aria-label="Применение шаблона открыток" value={applyToAll ? 'all' : 'first'} onChange={event => setApplyToAll(event.target.value === 'all')}><option value="first">Только к первой открытке</option><option value="all">Ко всем открыткам независимыми копиями</option></select></Field>}
        {mode === 'replace' && <p className="postcard-replace-warning" role="note">Дизайн текущей открытки будет заменён. Формат можно сохранить или изменить; координаты и абсолютные размеры элементов выбранной композиции сохранятся. Действие можно отменить в редакторе.</p>}
        {mode === 'add' && (project?.postcards.length ?? 0) >= 20 && <p className="postcard-replace-warning" role="alert">В проекте уже 20 открыток. Удалите одну, чтобы добавить новую.</p>}
        {mode === 'new' && <p className="postcard-create-note">Каждая открытка редактируется отдельно. Формат по умолчанию используется для новых открыток.</p>}
      </div></div>
    </Modal>}
  </SiteLayout>;
}

export default PostcardGallery;
