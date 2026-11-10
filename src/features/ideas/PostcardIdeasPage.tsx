import { ArrowLeft, ArrowRight } from "lucide-react";
import { assetUrl } from "../../content/assets";
import type { PostcardProject } from "../../domain/postcards/types";
import {
  postcardIdeasArtwork,
  postcardIdeasHeroArtwork,
} from "../../data/site-art";
import { SavedProjectNotice } from "../gallery/SavedProjectNotice";
import { SiteLayout } from "../../shared/layout/SiteLayout";
import { BowDivider } from "../../shared/ui/BowDivider";
import "./ideas-page.css";

const postcardIdeas = [
  {
    artwork: postcardIdeasArtwork.framed,
    title: "Открытка в рамке",
    description:
      "Превратите любимую праздничную иллюстрацию в небольшой постер! Подберите подходящую рамку и украсьте полку, комод или стену новогодним акцентом.",
    imageDescription:
      "Зимняя открытка в деревянной рамке с паспарту над полкой.",
  },
  {
    artwork: postcardIdeasArtwork.garland,
    title: "Гирлянда из открыток",
    description:
      "Соберите несколько любимых открыток в праздничную гирлянду. Просто прикрепите их мини-прищепками к шпагату или ленте и украсьте стену, полку или пространство над камином.",
    imageDescription:
      "Четыре открытки прикреплены деревянными прищепками к шпагату на стене.",
  },
  {
    artwork: postcardIdeasArtwork.ornaments,
    title: "Ёлочные украшения",
    description:
      "Добавьте немного бумажного декора на новогоднюю ёлку! Выберите небольшие открытки с зимними иллюстрациями, проделайте отверстие и подвесьте их на тонкую ленту или шнурок. Вы также можете использовать прищепки или зажимы.",
    imageDescription:
      "Зимние открытки висят на еловых ветвях с помощью золотистых зажимов.",
  },
  {
    artwork: postcardIdeasArtwork.placeCard,
    title: "Карточка для рассадки гостей",
    description:
      "Создайте персональные карточки для праздничного стола. Добавьте имя гостя, и красивую иллюстрацию — такая деталь поможет сделать сервировку ещё более уютной.",
    imageDescription:
      "Именная карточка с малиновкой стоит на тарелке в праздничной сервировке.",
  },
  {
    artwork: postcardIdeasArtwork.menu,
    title: "Меню праздничного стола",
    description:
      "Превратите открытку в красивое меню новогоднего ужина. Перечислите праздничные блюда, добавьте небольшие иллюстрации и разместите карточку возле каждого места или в центре стола.",
    imageDescription: "Меню ужина с зимними иллюстрациями лежит на тарелке.",
  },
  {
    artwork: postcardIdeasArtwork.bookmark,
    title: "Закладка для книги",
    description:
      "Любимая зимняя иллюстрация может стать закладкой для книги! Выберите вытянутый формат, добавьте небольшое пожелание или оставьте только рисунок. Отличная идея для небольшого дополнения к книжному подарку.",
    imageDescription:
      "Узкая закладка с заснеженным домиком и малиновкой в раскрытой книге.",
  },
];

export function PostcardIdeasPage({
  hasProject,
  project,
  onOpenEditor,
  onNew,
}: {
  hasProject: boolean;
  project: PostcardProject | null;
  onOpenEditor: () => void;
  onNew: () => void;
}) {
  return (
    <SiteLayout current="ideas" hasProject={hasProject}>
      <main className="ideas-page postcard-ideas-page">
        <a className="ideas-back-link" href="#ideas">
          <ArrowLeft size={17} aria-hidden="true" />
          Все идеи
        </a>
        <section className="ideas-hero" aria-labelledby="postcard-ideas-title">
          <div className="ideas-hero__copy">
            <h1 id="postcard-ideas-title" className="ideas-hero__title">
              Открытки и не только
            </h1>
            <p className="ideas-hero__description">
              Открытки могут быть не только способом передать тёплые пожелания!
              Немного фантазии — и они превратятся в украшение интерьера,
              элемент праздничной сервировки или полезный аксессуар. Просто
              выберите в нашем редакторе подходящий размер, добавьте текст или
              используйте только иллюстрацию.
            </p>
            <div className="ideas-hero__actions">
              {project ? (
                <SavedProjectNotice
                  compact
                  className="postcard-saved-project"
                  label="Сохранённый проект открыток"
                  name={project.name}
                  status="Ваши открытки сохранены"
                  description={`Открыток в проекте: ${project.postcards.length}`}
                  onContinue={onOpenEditor}
                  onNew={onNew}
                />
              ) : (
                <button
                  type="button"
                  className="public-button public-button--pill"
                  onClick={onOpenEditor}
                >
                  Создать открытку <ArrowRight size={19} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="ideas-hero__art">
            <img
              src={assetUrl(postcardIdeasHeroArtwork.src)}
              width={postcardIdeasHeroArtwork.width}
              height={postcardIdeasHeroArtwork.height}
              alt=""
              draggable={false}
              fetchPriority="high"
            />
          </div>
        </section>
        <BowDivider className="ideas-divider" />
        <section aria-labelledby="postcard-inspiration-title">
          <h2 id="postcard-inspiration-title" className="ideas-section-title">
            Идеи для вдохновения
          </h2>
          <ul className="ideas-grid postcard-ideas-grid" role="list">
            {postcardIdeas.map((idea) => (
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
          <div className="postcard-ideas-create">
            <button
              type="button"
              className="public-button public-button--pill"
              onClick={onOpenEditor}
            >
              Создать открытку <ArrowRight size={19} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
