import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import {
  artisticPostcardTemplates,
  blankPostcardTemplates,
} from "../../data/postcard-templates";
import { fitPostcardTemplate } from "../../domain/postcards/templates";
import {
  getPostcardSize,
  type CreatePostcardProjectOptions,
  type Postcard,
  type PostcardFormat,
  type PostcardProject,
  type PostcardTemplate,
} from "../../domain/postcards/types";
import {
  postcardTemplateArtwork,
  templateHeroArtwork,
} from "../../data/site-art";
import { assetUrl } from "../../content/assets";
import { PostcardSvg } from "../../rendering/PostcardSvg";
import { SiteLayout } from "../../shared/layout/SiteLayout";
import { BowDivider } from "../../shared/ui/BowDivider";
import { Button, Field } from "../../shared/ui/Controls";
import { Modal } from "../../shared/ui/Modal";
import { SavedProjectNotice } from "../gallery/SavedProjectNotice";
import { CreateProjectLink } from "../../shared/ui/CreateProjectLink";
import { PostcardCornerRadiusField } from "./PostcardCornerRadiusField";
import { useCatalogScroll } from "../gallery/useCatalogScroll";
import "../gallery/template-gallery.css";
import "./postcard-gallery.css";

type GalleryMode = "new" | "replace" | "add";
export interface PostcardGalleryProps {
  hasProject: boolean;
  project: PostcardProject | null;
  onContinue: () => void;
  onCreate: (options: CreatePostcardProjectOptions) => void;
  onApply: (template: PostcardTemplate, format: PostcardFormat, cornerRadius: number) => void;
  onAdd: (template: PostcardTemplate, format: PostcardFormat, cornerRadius: number) => void;
  scrollToTemplates?: boolean;
}
const formatLabels: Record<PostcardFormat, string> = {
  "a6-portrait": "A6 · вертикальная · 105 × 148 мм",
  "a6-landscape": "A6 · горизонтальная · 148 × 105 мм",
  square: "Квадрат · 105 × 105 мм",
};
const preview = (template: PostcardTemplate, cornerRadius = 0): Postcard => ({
  id: `preview-${template.id}`,
  format: template.format,
  cornerRadius,
  background: template.background,
  elements: template.elements,
});

export function PostcardGallery({
  hasProject,
  project,
  onContinue,
  onCreate,
  onApply,
  onAdd,
  scrollToTemplates = false,
}: PostcardGalleryProps) {
  const { catalog, scrollToCatalog } = useCatalogScroll(scrollToTemplates);
  const [selected, setSelected] = useState<PostcardTemplate | null>(null);
  const [mode, setMode] = useState<GalleryMode>("new");
  const [name, setName] = useState("Мои открытки");
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<PostcardFormat>("a6-portrait");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [applyToAll, setApplyToAll] = useState(false);
  const fittedTemplate = selected && fitPostcardTemplate(selected, format);
  const active = project?.postcards.find(
    (card) => card.id === project.activePostcardId,
  );
  const choose = (
    template: PostcardTemplate,
    action: GalleryMode = project ? "replace" : "new",
  ) => {
    setSelected(template);
    setMode(action);
    setCount(1);
    setApplyToAll(false);
    setCornerRadius(action === 'replace' && active ? active.cornerRadius ?? 0 : project?.defaultCornerRadius ?? 0);
    setFormat(
      template.elements.length
        ? template.format
        : action === "replace" && active
          ? active.format
          : action === "add" && project
            ? project.defaultFormat
            : template.format,
    );
  };
  const changeMode = (value: GalleryMode) => {
    setMode(value);
    setCornerRadius(value === 'replace' && active ? active.cornerRadius ?? 0 : project?.defaultCornerRadius ?? 0);
    setFormat(
      selected?.elements.length
        ? selected.format
        : value === "replace" && active
          ? active.format
          : value === "add" && project
            ? project.defaultFormat
            : (selected?.format ?? "a6-portrait"),
    );
  };
  const submit = () => {
    if (!fittedTemplate) return;
    if (mode === "new") {
      if (!Number.isInteger(count) || count < 1 || count > 20 || !name.trim())
        return;
      onCreate({
        name: name.trim(),
        count,
        format,
        cornerRadius,
        template: fittedTemplate,
        applyToAll,
      });
    } else if (mode === "replace") onApply(fittedTemplate, format, cornerRadius);
    else onAdd(fittedTemplate, format, cornerRadius);
    setSelected(null);
  };
  const templateCard = (template: PostcardTemplate, blank: boolean) => {
    const card = preview(template),
      size = getPostcardSize(card);
    const cover = postcardTemplateArtwork.find(
      (artwork) => artwork.templateId === template.id,
    );
    return (
      <button
        type="button"
        key={template.id}
        className="template-card postcard-start-card"
        data-postcard-template={template.id}
        aria-label={`${blank ? "Начать" : "Выбрать"}: ${template.name.ru}`}
        onClick={() => choose(template)}
      >
        <div
          className={`postcard-start-card__art ${cover ? "postcard-start-card__art--cover" : ""}`}
        >
          {cover ? (
            <img
              src={assetUrl(cover.src)}
              width={cover.width}
              height={cover.height}
              alt=""
              loading="lazy"
              draggable={false}
            />
          ) : (
            <>
              <span
                className="postcard-start-card__paper"
                style={{ aspectRatio: `${size.width} / ${size.height}` }}
              >
                <PostcardSvg
                  postcard={card}
                  idPrefix={`catalog-${template.id}`}
                />
              </span>
              {blank && (
                <span className="postcard-start-card__plus" aria-hidden="true">
                  <Plus size={24} />
                </span>
              )}
            </>
          )}
        </div>
        <div className="template-card__details">
          <div>
            <h3>{template.name.ru}</h3>
            <p>
              {size.width} × {size.height} мм
            </p>
          </div>
          <span className="template-card__arrow" aria-hidden="true">
            <ArrowRight size={20} />
          </span>
        </div>
      </button>
    );
  };
  return (
    <SiteLayout current="postcards" hasProject={hasProject}>
      <main className="template-gallery-main postcard-gallery-main">
        <section className="template-hero" aria-labelledby="postcards-title">
          <div className="template-hero__copy">
            <h1 id="postcards-title">Открытки</h1>
            <p>Тёплые слова и зимние истории,<br />которые хочется подарить</p>
            <div className="template-hero__actions">
            {project ? (
              <SavedProjectNotice
                compact
                className="postcard-saved-project"
                label="Сохранённый проект открыток"
                name={project.name}
                status="Ваши открытки сохранены"
                description={`Открыток в проекте: ${project.postcards.length}`}
                onContinue={onContinue}
                onNew={() => choose(blankPostcardTemplates[0], "new")}
              />
            ) : (
              <CreateProjectLink className="template-hero__create" direction="postcards" onClick={event => { event.preventDefault(); scrollToCatalog(); }} />
            )}
            </div>
          </div>
          <div className="template-hero__art">
            <img
              src={assetUrl(templateHeroArtwork.postcards.src)}
              width={templateHeroArtwork.postcards.width}
              height={templateHeroArtwork.postcards.height}
              alt=""
              draggable={false}
              data-art-slot={templateHeroArtwork.postcards.id}
              fetchPriority="high"
            />
          </div>
        </section>
        <div className="template-intro" ref={catalog} tabIndex={-1}>
          <BowDivider className="template-intro__divider" />
          <h2 id="postcard-starts-title">Начните с чистой открытки</h2>
          <p className="postcard-gallery-intro">
            Выберите формат, добавьте текст, иллюстрации и праздничные детали.{" "}
            <br />В одном проекте — от 1 до 20 открыток.
          </p>
        </div>
        <section
          className="template-catalog"
          aria-labelledby="postcard-starts-title"
        >
          <div className="template-grid">
            {blankPostcardTemplates.map((template) =>
              templateCard(template, true),
            )}
          </div>
        </section>
        <section
          className="postcard-artistic-catalog"
          aria-labelledby="postcard-artistic-title"
        >
          <h2 id="postcard-artistic-title">Выберите готовую композицию</h2>
          <p className="postcard-gallery-intro">
            Добавьте свои пожелания к готовому дизайну.
            <br />Надписи, иллюстрации и фон можно изменить в редакторе.
          </p>
          {artisticPostcardTemplates.length ? (
            <div className="template-grid">
              {artisticPostcardTemplates.map((template) =>
                templateCard(template, false),
              )}
            </div>
          ) : (
            <p>
              Коллекция пока пуста. Вы можете собрать собственную композицию в
              редакторе.
            </p>
          )}
        </section>
      </main>
      {selected && fittedTemplate && (
        <Modal
          title={selected.name.ru}
          wide
          className="postcard-create-modal"
          onClose={() => setSelected(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Отмена
              </Button>
              <Button
                disabled={
                  (mode === "new" &&
                    (!name.trim() ||
                      !Number.isInteger(count) ||
                      count < 1 ||
                      count > 20)) ||
                  (mode === "add" && (project?.postcards.length ?? 0) >= 20)
                }
                onClick={submit}
              >
                {mode === "new"
                  ? "Создать проект"
                  : mode === "replace"
                    ? "Заменить дизайн"
                    : "Добавить открытку"}
                <ArrowRight size={17} />
              </Button>
            </>
          }
        >
          <div className="postcard-create-layout">
            <div className="postcard-create-preview">
              <span
                style={{
                  aspectRatio: `${getPostcardSize({ format }).width} / ${getPostcardSize({ format }).height}`,
                }}
              >
                <PostcardSvg
                  postcard={preview(fittedTemplate, cornerRadius)}
                  quality="print"
                  idPrefix="postcard-create-preview"
                />
              </span>
            </div>
            <div className="postcard-create-fields">
              {project && (
                <fieldset className="postcard-create-mode">
                  <legend>Действие</legend>
                  {(
                    [
                      ["new", "Новый проект"],
                      ["replace", "Заменить текущую открытку"],
                      ["add", "Добавить в проект"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="postcard-create-mode"
                        value={value}
                        checked={mode === value}
                        onChange={() => changeMode(value)}
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
              )}
              {mode === "new" && (
                <>
                  <Field label="Название проекта">
                    <input
                      aria-label="Название проекта открыток"
                      maxLength={120}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </Field>
                  <Field
                    label="Количество открыток"
                    hint="От 1 до 20; позже открытки можно добавлять, копировать и удалять."
                  >
                    <input
                      aria-label="Количество открыток"
                      type="number"
                      min={1}
                      max={20}
                      step={1}
                      value={Number.isFinite(count) ? count : ""}
                      onChange={(event) => setCount(event.target.valueAsNumber)}
                    />
                  </Field>
                </>
              )}
              <Field
                label={
                  mode === "new" ? "Формат по умолчанию" : "Формат открытки"
                }
              >
                <select
                  aria-label="Формат открытки"
                  value={format}
                  onChange={(event) =>
                    setFormat(event.target.value as PostcardFormat)
                  }
                >
                  {Object.entries(formatLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                      {selected.elements.length > 0 && value === selected.format
                        ? " (Рекомендуется)"
                        : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <PostcardCornerRadiusField value={cornerRadius} onChange={setCornerRadius} />
              {mode === "new" && (
                <Field label="Применить стартовый дизайн">
                  <select
                    aria-label="Применение шаблона открыток"
                    value={applyToAll ? "all" : "first"}
                    onChange={(event) =>
                      setApplyToAll(event.target.value === "all")
                    }
                  >
                    <option value="first">Только к первой открытке</option>
                    <option value="all">
                      Ко всем открыткам независимыми копиями
                    </option>
                  </select>
                </Field>
              )}
              {mode === "replace" && (
                <p className="postcard-replace-warning" role="note">
                  Дизайн текущей открытки будет заменён. Действие можно отменить
                  в редакторе.
                </p>
              )}
              {mode === "add" && (project?.postcards.length ?? 0) >= 20 && (
                <p className="postcard-replace-warning" role="alert">
                  В проекте уже 20 открыток. Удалите одну, чтобы добавить новую.
                </p>
              )}
              {mode === "new" && (
                <p className="postcard-create-note">
                  Каждая открытка редактируется отдельно. Формат по умолчанию
                  используется для новых открыток.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </SiteLayout>
  );
}

export default PostcardGallery;
