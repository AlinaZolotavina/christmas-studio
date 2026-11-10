import { ArrowLeft, ArrowRight } from "lucide-react";
import { assetUrl } from "../../content/assets";
import type { ProjectDocument } from "../../domain/types";
import { tagIdeasArtwork, tagIdeasHeroArtwork } from "../../data/site-art";
import { SavedProjectNotice } from "../gallery/SavedProjectNotice";
import { SiteLayout } from "../../shared/layout/SiteLayout";
import { BowDivider } from "../../shared/ui/BowDivider";
import "./ideas-page.css";

const tagIdeas = [
  {
    artwork: tagIdeasArtwork.ribbon,
    title: "Лента",
    description:
      "Проденьте ленту, которой перевязан подарок, через отверстие в адвент-теге. Если отверстия нет, можно просто разместить адвент-тег под лентой.",
    imageDescription:
      "Адвент-теги закреплены на подарках зелёной и красной лентами.",
  },
  {
    artwork: tagIdeasArtwork.twine,
    title: "Шпагат",
    description:
      "Используйте натуральный или декоративный шпагат вместо ленты. Такой адвент-тег особенно красиво смотрится с крафтовой бумагой и упаковкой в природном стиле.",
    imageDescription:
      "Теги привязаны шпагатом к подарочной коробке и ручке пакета.",
  },
  {
    artwork: tagIdeasArtwork.tape,
    title: "Декоративный скотч",
    description:
      "Закрепите адвент-тег с помощью декоративного скотча. Лучше подобрать его цвет и рисунок в тон иллюстрации, чтобы оформление выглядело гармонично.",
    imageDescription:
      "Тег со снеговиком закреплён на коробке зелёным скотчем с ёлочками.",
  },
  {
    artwork: tagIdeasArtwork.waxSeal,
    title: "Сургучная печать",
    description:
      "Сургучная печать не только закрепит адвент-тег на упаковке, но и добавит подарку винтажного очарования.",
    imageDescription:
      "Тег с зимним домиком закреплён красной сургучной печатью со снежинкой.",
  },
  {
    artwork: tagIdeasArtwork.clothespin,
    title: "Мини-прищепка",
    description:
      "Адвент-тег без отверстия можно прикрепить к ленте небольшой декоративной прищепкой.",
    imageDescription:
      "Круглый тег прикреплён деревянной мини-прищепкой к бархатной ленте.",
  },
  {
    artwork: tagIdeasArtwork.clip,
    title: "Зажим",
    description:
      "Закрепите адвент-тег металлическим зажимом на краю подарочного пакета. Стильная деталь, которая не требует дополнительных отверстий или клея.",
    imageDescription:
      "Тег со снегирём закреплён золотистым зажимом на подарочном пакете.",
  },
  {
    artwork: tagIdeasArtwork.corners,
    title: "Декоративные уголки",
    description:
      "Приклейте к коробке небольшие бумажные уголки и вставьте в них адвент-тег. Получится аккуратное оформление, напоминающее миниатюрную фоторамку.",
    imageDescription:
      "Тег с оленёнком вставлен в четыре золотистых уголка на подарочной коробке.",
  },
  {
    artwork: tagIdeasArtwork.glue,
    title: "Прямо на упаковку",
    description:
      "Просто приклейте адвент-тег к упаковочной бумаге. Можно также использовать двусторонний скотч.",
    imageDescription:
      "Тег с малиновкой приклеен к крафтовой упаковке рядом с хвойной веточкой.",
  },
  {
    artwork: tagIdeasArtwork.ring,
    title: "Металлическое кольцо",
    description:
      "Проденьте металлическое кольцо через отверстие адвент-тега и ручку подарочного пакета — получится крепление, напоминающее брелок.",
    imageDescription:
      "Тег с фонариком подвешен на металлическом кольце к ручке подарочного пакета.",
  },
  {
    artwork: tagIdeasArtwork.elastic,
    title: "Резинка",
    description:
      "Наденьте резинку на подарок так, чтобы она обхватывала упаковку, а адвент-тег расположите под ней. Такой способ отлично подходит для бутылок и других подарков необычной формы.",
    imageDescription:
      "Адвент-тег удерживается красной резинкой на подарочной бутылке.",
  },
];

export function TagIdeasPage({
  project,
  onOpenEditor,
  onNew,
}: {
  project: ProjectDocument | null;
  onOpenEditor: () => void;
  onNew: () => void;
}) {
  return (
    <SiteLayout current="ideas" hasProject={Boolean(project)}>
      <main className="ideas-page tag-ideas-page">
        <a className="ideas-back-link" href="#ideas">
          <ArrowLeft size={17} aria-hidden="true" />
          Все идеи
        </a>
        <section className="ideas-hero" aria-labelledby="tag-ideas-title">
          <div className="ideas-hero__copy">
            <h1 id="tag-ideas-title" className="ideas-hero__title">
              Крепление адвент-тегов
            </h1>
            <p className="ideas-hero__description">
              Адвент-теги — не только способ обозначить номер подарка, но и
              красивая деталь праздничной упаковки. Их можно прикрепить разными
              способами, сочетая с лентами, шпагатом и другими декоративными
              элементами.
            </p>
            <div className="ideas-hero__actions">
              {project ? (
                <SavedProjectNotice
                  compact
                  className="tag-saved-project"
                  label="Сохранённый проект адвент-тегов"
                  name={project.name}
                  status="Ваши адвент-теги сохранены"
                  description={`Карточек в наборе: ${project.cardCount}`}
                  onContinue={onOpenEditor}
                  onNew={onNew}
                />
              ) : (
                <button
                  type="button"
                  className="public-button public-button--pill"
                  onClick={onOpenEditor}
                >
                  Создать адвент-теги{" "}
                  <ArrowRight size={19} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="ideas-hero__art">
            <img
              src={assetUrl(tagIdeasHeroArtwork.src)}
              width={tagIdeasHeroArtwork.width}
              height={tagIdeasHeroArtwork.height}
              alt=""
              draggable={false}
              fetchPriority="high"
            />
          </div>
        </section>
        <BowDivider className="ideas-divider" />
        <section aria-labelledby="tag-inspiration-title">
          <h2 id="tag-inspiration-title" className="ideas-section-title">
            Идеи для вдохновения
          </h2>
          <ul className="ideas-grid tag-ideas-grid" role="list">
            {tagIdeas.map((idea) => (
              <li key={idea.artwork.id} className="idea-card idea-card--static">
                <article aria-labelledby={`${idea.artwork.id}-title`}>
                  <div className="idea-card__art">
                    <img
                      src={assetUrl(idea.artwork.src)}
                      width={idea.artwork.width}
                      height={idea.artwork.height}
                      alt={idea.imageDescription}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                  <div className="idea-card__body">
                    <h3
                      className="idea-card__title"
                      id={`${idea.artwork.id}-title`}
                    >
                      {idea.title}
                    </h3>
                    <p className="idea-card__description">{idea.description}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <div className="tag-ideas-create">
            <button
              type="button"
              className="public-button public-button--pill"
              onClick={onOpenEditor}
            >
              Создать адвент-теги <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
