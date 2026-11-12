import { localized, t } from '../../i18n';
import { rich } from '../../i18n/rich';
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { artisticPostcardTemplates, blankPostcardTemplates, } from "../../data/postcard-templates";
import { fitPostcardTemplate } from "../../domain/postcards/templates";
import { getPostcardSize, type CreatePostcardProjectOptions, type Postcard, type PostcardFormat, type PostcardProject, type PostcardTemplate, } from "../../domain/postcards/types";
import { postcardTemplateArtwork, templateHeroArtwork, } from "../../data/site-art";
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
    "a6-portrait": t("pages.postcards.formats.portrait"),
    "a6-landscape": t("pages.postcards.formats.landscape"),
    square: t("pages.postcards.formats.square"),
};
const preview = (template: PostcardTemplate, cornerRadius = 0): Postcard => ({
    id: `preview-${template.id}`,
    format: template.format,
    cornerRadius,
    background: template.background,
    elements: template.elements,
});
export function PostcardGallery({ hasProject, project, onContinue, onCreate, onApply, onAdd, scrollToTemplates = false, }: PostcardGalleryProps) {
    const { catalog, scrollToCatalog } = useCatalogScroll(scrollToTemplates);
    const [selected, setSelected] = useState<PostcardTemplate | null>(null);
    const [mode, setMode] = useState<GalleryMode>("new");
    const [name, setName] = useState(t("projects.create.postcardsDefaultName"));
    const [count, setCount] = useState(1);
    const [format, setFormat] = useState<PostcardFormat>("a6-portrait");
    const [cornerRadius, setCornerRadius] = useState(0);
    const [applyToAll, setApplyToAll] = useState(false);
    const fittedTemplate = selected && fitPostcardTemplate(selected, format);
    const active = project?.postcards.find((card) => card.id === project.activePostcardId);
    const choose = (template: PostcardTemplate, action: GalleryMode = project ? "replace" : "new") => {
        setSelected(template);
        setMode(action);
        setCount(1);
        setApplyToAll(false);
        setCornerRadius(action === 'replace' && active ? active.cornerRadius ?? 0 : project?.defaultCornerRadius ?? 0);
        setFormat(template.elements.length
            ? template.format
            : action === "replace" && active
                ? active.format
                : action === "add" && project
                    ? project.defaultFormat
                    : template.format);
    };
    const changeMode = (value: GalleryMode) => {
        setMode(value);
        setCornerRadius(value === 'replace' && active ? active.cornerRadius ?? 0 : project?.defaultCornerRadius ?? 0);
        setFormat(selected?.elements.length
            ? selected.format
            : value === "replace" && active
                ? active.format
                : value === "add" && project
                    ? project.defaultFormat
                    : (selected?.format ?? "a6-portrait"));
    };
    const submit = () => {
        if (!fittedTemplate)
            return;
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
        }
        else if (mode === "replace")
            onApply(fittedTemplate, format, cornerRadius);
        else
            onAdd(fittedTemplate, format, cornerRadius);
        setSelected(null);
    };
    const templateCard = (template: PostcardTemplate, blank: boolean) => {
        const card = preview(template), size = getPostcardSize(card);
        const cover = postcardTemplateArtwork.find((artwork) => artwork.templateId === template.id);
        return (<button type="button" key={template.id} className="template-card postcard-start-card" data-postcard-template={template.id} aria-label={t(blank ? "pages.postcards.startTemplate" : "pages.postcards.selectTemplate", { templateName: localized(template.name) })} onClick={() => choose(template)}>
        <div className={`postcard-start-card__art ${cover ? "postcard-start-card__art--cover" : ""}`}>
          {cover ? (<img src={assetUrl(cover.src)} width={cover.width} height={cover.height} alt="" loading="lazy" draggable={false}/>) : (<>
              <span className="postcard-start-card__paper" style={{ aspectRatio: `${size.width} / ${size.height}` }}>
                <PostcardSvg postcard={card} idPrefix={`catalog-${template.id}`}/>
              </span>
              {blank && (<span className="postcard-start-card__plus" aria-hidden="true">
                  <Plus size={24}/>
                </span>)}
            </>)}
        </div>
        <div className="template-card__details">
          <div>
            <h3>{localized(template.name)}</h3>
            <p>{t("pages.postcards.dimensions", { width: size.width, height: size.height })}</p>
          </div>
          <span className="template-card__arrow" aria-hidden="true">
            <ArrowRight size={20}/>
          </span>
        </div>
      </button>);
    };
    return (<SiteLayout current="postcards" hasProject={hasProject}>
      <main className="template-gallery-main postcard-gallery-main">
        <section className="template-hero" aria-labelledby="postcards-title">
          <div className="template-hero__copy">
            <h1 id="postcards-title">{t("pages.postcards.title")}</h1>
            <p>{t("pages.postcards.description")}</p>
            <div className="template-hero__actions">
            {project ? (<SavedProjectNotice compact className="postcard-saved-project" label={t("projects.saved.postcards.label")} name={project.name} status={t("projects.saved.postcards.status")} description={t("projects.saved.postcards.count", { count: project.postcards.length })} onContinue={onContinue} onNew={() => choose(blankPostcardTemplates[0], "new")}/>) : (<CreateProjectLink className="template-hero__create" direction="postcards" onClick={event => { event.preventDefault(); scrollToCatalog(); }}/>)}
            </div>
          </div>
          <div className="template-hero__art">
            <img src={assetUrl(templateHeroArtwork.postcards.src)} width={templateHeroArtwork.postcards.width} height={templateHeroArtwork.postcards.height} alt="" draggable={false} data-art-slot={templateHeroArtwork.postcards.id} fetchPriority="high"/>
          </div>
        </section>
        <div className="template-intro" ref={catalog} tabIndex={-1}>
          <BowDivider className="template-intro__divider"/>
          <h2 id="postcard-starts-title">{t("pages.postcards.blankTitle")}</h2>
          <p className="postcard-gallery-intro">{rich("pages.postcards.blankDescription", {}, { lineBreak: <br className="postcard-intro-desktop-break" /> })}</p>
        </div>
        <section className="template-catalog" aria-labelledby="postcard-starts-title">
          <div className="template-grid">
            {blankPostcardTemplates.map((template) => templateCard(template, true))}
          </div>
        </section>
        <section className="postcard-artistic-catalog" aria-labelledby="postcard-artistic-title">
          <h2 id="postcard-artistic-title">{t("pages.postcards.artisticTitle")}</h2>
          <p className="postcard-gallery-intro">{rich("pages.postcards.artisticDescription", {}, { lineBreak: <br /> })}</p>
          {artisticPostcardTemplates.length ? (<div className="template-grid">
              {artisticPostcardTemplates.map((template) => templateCard(template, false))}
            </div>) : (<p>{t("pages.postcards.emptyCollection")}</p>)}
        </section>
      </main>
      {selected && fittedTemplate && (<Modal title={localized(selected.name)} wide className="postcard-create-modal" onClose={() => setSelected(null)} footer={<>
              <Button variant="secondary" onClick={() => setSelected(null)}>{t("common.cancel")}</Button>
              <Button disabled={(mode === "new" &&
                    (!name.trim() ||
                        !Number.isInteger(count) ||
                        count < 1 ||
                        count > 20)) ||
                    (mode === "add" && (project?.postcards.length ?? 0) >= 20)} onClick={submit}>
                {mode === "new"
                    ? t("pages.postcards.create") : mode === "replace"
                    ? t("pages.postcards.replace") : t("pages.postcards.add")}
                <ArrowRight size={17}/>
              </Button>
            </>}>
          <div className="postcard-create-layout">
            <div className="postcard-create-preview">
              <span style={{
                aspectRatio: `${getPostcardSize({ format }).width} / ${getPostcardSize({ format }).height}`,
            }}>
                <PostcardSvg postcard={preview(fittedTemplate, cornerRadius)} quality="print" idPrefix="postcard-create-preview"/>
              </span>
            </div>
            <div className="postcard-create-fields">
              {project && (<fieldset className="postcard-create-mode">
                  <legend>{t("pages.postcards.mode.label")}</legend>
                  {([
                    ["new", t("pages.postcards.mode.new")],
                    ["replace", t("pages.postcards.mode.replace")],
                    ["add", t("pages.postcards.mode.add")],
                ] as const).map(([value, label]) => (<label key={value}>
                      <input type="radio" name="postcard-create-mode" value={value} checked={mode === value} onChange={() => changeMode(value)}/>
                      {label}
                    </label>))}
                </fieldset>)}
              {mode === "new" && (<>
                  <Field label={t("pages.postcards.namePlaceholder")}>
                    <input aria-label={t("pages.postcards.nameLabel")} maxLength={120} value={name} onChange={(event) => setName(event.target.value)}/>
                  </Field>
                  <Field label={t("pages.postcards.countLabel")} hint={t("pages.postcards.countHint")}>
                    <input aria-label={t("pages.postcards.countLabel")} type="number" min={1} max={20} step={1} value={Number.isFinite(count) ? count : ""} onChange={(event) => setCount(event.target.valueAsNumber)}/>
                  </Field>
                </>)}
              <Field label={mode === "new" ? t("pages.postcards.defaultFormat") : t("pages.postcards.formatLabel")}>
                <select aria-label={t("pages.postcards.formatLabel")} value={format} onChange={(event) => setFormat(event.target.value as PostcardFormat)}>
                  {Object.entries(formatLabels).map(([value, label]) => (<option key={value} value={value}>
                      {selected.elements.length > 0 && value === selected.format
                    ? t("pages.postcards.recommended", { format: label }) : label}
                    </option>))}
                </select>
              </Field>
              <PostcardCornerRadiusField value={cornerRadius} onChange={setCornerRadius}/>
              {mode === "new" && (<Field label={t("pages.postcards.applyDesign")}>
                  <select aria-label={t("pages.postcards.applyLabel")} value={applyToAll ? "all" : "first"} onChange={(event) => setApplyToAll(event.target.value === "all")}>
                    <option value="first">{t("pages.postcards.applyFirst")}</option>
                    <option value="all">{t("pages.postcards.applyAll")}</option>
                  </select>
                </Field>)}
              {mode === "replace" && (<p className="postcard-replace-warning" role="note">{t("pages.postcards.replaceWarning")}</p>)}
              {mode === "add" && (project?.postcards.length ?? 0) >= 20 && (<p className="postcard-replace-warning" role="alert">{t("pages.postcards.fullProject")}</p>)}
              {mode === "new" && (<p className="postcard-create-note">{t("pages.postcards.newProjectHint")}</p>)}
            </div>
          </div>
        </Modal>)}
    </SiteLayout>);
}
export default PostcardGallery;
