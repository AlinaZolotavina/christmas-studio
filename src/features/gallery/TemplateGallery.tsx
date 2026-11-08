import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ProjectDocument, TemplateDefinition } from "../../domain/types";
import { templates } from "../../content/templates";
import { assetUrl } from "../../content/assets";
import { templateHeroArtwork } from "../../data/site-art";
import { CardSvg } from "../../rendering/CardSvg";
import { Button, IconButton } from "../../shared/ui/Controls";
import { Modal } from "../../shared/ui/Modal";
import { ArtworkPlaceholder } from "../../shared/ui/ArtworkPlaceholder";
import { BowDivider } from "../../shared/ui/BowDivider";
import { previewCard } from "./previewCard";
import { SiteLayout } from "../../shared/layout/SiteLayout";
import { SavedProjectNotice } from './SavedProjectNotice';
import { CreateProjectLink } from '../../shared/ui/CreateProjectLink';
import { useCatalogScroll } from './useCatalogScroll';
import "./template-gallery.css";

export function TemplateGallery({
  onCreate,
  hasProject = false,
  project,
  onContinue,
  scrollToTemplates = false,
}: {
  onCreate: (templateId: string, count: 24 | 31) => void;
  hasProject?: boolean;
  project: ProjectDocument | null;
  onContinue: () => void;
  scrollToTemplates?: boolean;
}) {
  const { catalog, scrollToCatalog } = useCatalogScroll(scrollToTemplates);
  const [selected, setSelected] = useState<TemplateDefinition | null>(null);
  const [choosingCount, setChoosingCount] = useState(false);
  const [count, setCount] = useState<24 | 31 | null>(null);
  const [slide, setSlide] = useState(0);
  const touchStart = useRef<number | null>(null);
  const select = (template: TemplateDefinition) => {
    setSelected(template);
    setSlide(0);
    setChoosingCount(false);
    setCount(null);
  };
  return (
    <SiteLayout current="tags" hasProject={hasProject}>
      <main className="template-gallery-main">
        <section className="template-hero" aria-labelledby="templates-title">
          <img
            src={assetUrl(templateHeroArtwork.left.src)}
            width={templateHeroArtwork.left.width}
            height={templateHeroArtwork.left.height}
            alt=""
            draggable={false}
            data-art-slot={templateHeroArtwork.left.id}
            className="template-hero__scene template-hero__scene--left"
            fetchPriority="high"
          />
          <img
            src={assetUrl(templateHeroArtwork.right.src)}
            width={templateHeroArtwork.right.width}
            height={templateHeroArtwork.right.height}
            alt=""
            draggable={false}
            data-art-slot={templateHeroArtwork.right.id}
            className="template-hero__scene template-hero__scene--right"
          />
          <div className="template-hero__copy">
            <h1 id="templates-title">Адвент-теги</h1>
            <p>
              Красивые наборы тегов для вашего{" "}
              <span className="template-hero__occasion">адвент-календаря</span>
            </p>
            {!project && <CreateProjectLink className="template-hero__create" direction="tags" onClick={event => { event.preventDefault(); scrollToCatalog(); }} />}
          </div>
        </section>
        {project && <SavedProjectNotice className="tag-saved-project" label="Сохранённый проект адвент-тегов" name={project.name} status="Ваши адвент-теги сохранены" description={`Карточек в наборе: ${project.cardCount}`} onContinue={onContinue} onNew={scrollToCatalog} />}
        <div className="template-intro" ref={catalog} tabIndex={-1}>
          <BowDivider className="template-intro__divider" />
          <h2 id="template-collections-title">Выберите свое настроение</h2>
        </div>
        <section
          className="template-catalog"
          aria-labelledby="template-collections-title"
        >
          <div className="template-grid">
            {templates.map((template, index) => (
              <button
                type="button"
                className="template-card"
                data-template-id={template.id}
                key={template.id}
                onClick={() => select(template)}
              >
                <div
                  className={`template-card__art template-card__art--${index}`}
                >
                  <ArtworkPlaceholder
                    kind="tag-pair"
                    slot={`template-${template.id}-cover`}
                  />
                </div>
                <div className="template-card__details">
                  <h3>{template.name}</h3>
                  <span className="template-card__arrow" aria-hidden="true">
                    <ArrowRight size={20} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
      {selected && (
        <Modal
          title={selected.name}
          headerless
          className="template-modal"
          wide
          onClose={() => setSelected(null)}
          footer={
            <>
              {choosingCount ? (
                <>
                  <Button
                    variant="quiet"
                    onClick={() => setChoosingCount(false)}
                  >
                    <ArrowLeft size={16} /> Назад
                  </Button>
                  <Button
                    disabled={count === null}
                    onClick={() => {
                      if (count) {
                        onCreate(selected.id, count);
                        setSelected(null);
                      }
                    }}
                  >
                    Создать проект <ArrowRight size={17} />
                  </Button>
                </>
              ) : (
                <Button onClick={() => setChoosingCount(true)}>
                  Выбрать шаблон <ArrowRight size={17} />
                </Button>
              )}
            </>
          }
        >
          <div className="template-preview">
            <div
              className="template-preview__art"
              onTouchStart={(event) => {
                touchStart.current = event.changedTouches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                if (touchStart.current === null) return;
                const distance =
                  event.changedTouches[0].clientX - touchStart.current;
                if (Math.abs(distance) > 35)
                  setSlide((value) =>
                    Math.max(0, Math.min(2, value + (distance < 0 ? 1 : -1))),
                  );
                touchStart.current = null;
              }}
            >
              <IconButton
                label="Предыдущий пример"
                disabled={slide === 0}
                onClick={() => setSlide((value) => Math.max(0, value - 1))}
              >
                <ChevronLeft size={21} />
              </IconButton>
              <div className="template-preview__tag">
                <CardSvg
                  card={previewCard(
                    selected,
                    [1, 12, 24][slide],
                    selected.assetIds[slide],
                  )}
                  idPrefix="template-dialog"
                />
              </div>
              <IconButton
                label="Следующий пример"
                disabled={slide === 2}
                onClick={() => setSlide((value) => Math.min(2, value + 1))}
              >
                <ChevronRight size={21} />
              </IconButton>
              <div className="preview-dots">
                {[0, 1, 2].map((index) => (
                  <button
                    type="button"
                    key={index}
                    className={index === slide ? "is-active" : ""}
                    aria-label={`Пример ${index + 1}`}
                    aria-pressed={index === slide}
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
            </div>
            <div className="template-preview__info">
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
              <p className="muted">
                Шрифт, иллюстрации и цвета можно изменить в редакторе.
              </p>
              <div className="count-picker" style={{ visibility: choosingCount ? 'visible' : 'hidden' }} aria-hidden={!choosingCount} inert={!choosingCount}>
                <h4>Сколько карточек хотите создать?</h4>
                <div className="count-picker__options">
                  {([24, 31] as const).map((value) => (
                    <button
                      key={value}
                      className={count === value ? "is-selected" : ""}
                      onClick={() => setCount(value)}
                      aria-pressed={count === value}
                    >
                      <strong>{value}</strong>
                      <span>{value === 31 ? 'карточка' : 'карточки'}</span>
                      {count === value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </SiteLayout>
  );
}
