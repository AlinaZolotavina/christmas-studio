import { t } from '../../i18n';
import { ArrowLeft, ArrowRight } from "lucide-react";
import { assetUrl } from "../../content/assets";
import type { PostcardProject } from "../../domain/postcards/types";
import { postcardIdeasArtwork, postcardIdeasHeroArtwork, } from "../../data/site-art";
import { SavedProjectNotice } from "../gallery/SavedProjectNotice";
import { SiteLayout } from "../../shared/layout/SiteLayout";
import { BowDivider } from "../../shared/ui/BowDivider";
import "./ideas-page.css";
const postcardIdeas = [
    {
        artwork: postcardIdeasArtwork.framed,
        title: t("pages.postcardIdeas.items.framed.title"),
        description: t("pages.postcardIdeas.items.framed.description"),
        imageDescription: t("pages.postcardIdeas.items.framed.imageAlt"),
    },
    {
        artwork: postcardIdeasArtwork.garland,
        title: t("pages.postcardIdeas.items.garland.title"),
        description: t("pages.postcardIdeas.items.garland.description"),
        imageDescription: t("pages.postcardIdeas.items.garland.imageAlt"),
    },
    {
        artwork: postcardIdeasArtwork.ornaments,
        title: t("pages.postcardIdeas.items.ornaments.title"),
        description: t("pages.postcardIdeas.items.ornaments.description"),
        imageDescription: t("pages.postcardIdeas.items.ornaments.imageAlt"),
    },
    {
        artwork: postcardIdeasArtwork.placeCard,
        title: t("pages.postcardIdeas.items.placeCard.title"),
        description: t("pages.postcardIdeas.items.placeCard.description"),
        imageDescription: t("pages.postcardIdeas.items.placeCard.imageAlt"),
    },
    {
        artwork: postcardIdeasArtwork.menu,
        title: t("pages.postcardIdeas.items.menu.title"),
        description: t("pages.postcardIdeas.items.menu.description"),
        imageDescription: t("pages.postcardIdeas.items.menu.imageAlt"),
    },
    {
        artwork: postcardIdeasArtwork.bookmark,
        title: t("pages.postcardIdeas.items.bookmark.title"),
        description: t("pages.postcardIdeas.items.bookmark.description"),
        imageDescription: t("pages.postcardIdeas.items.bookmark.imageAlt"),
    },
];
export function PostcardIdeasPage({ hasProject, project, onOpenEditor, onNew, }: {
    hasProject: boolean;
    project: PostcardProject | null;
    onOpenEditor: () => void;
    onNew: () => void;
}) {
    return (<SiteLayout current="ideas" hasProject={hasProject}>
      <main className="ideas-page postcard-ideas-page">
        <a className="ideas-back-link" href="#ideas">
          <ArrowLeft size={17} aria-hidden="true"/>{t("pages.postcardIdeas.back")}</a>
        <section className="ideas-hero" aria-labelledby="postcard-ideas-title">
          <div className="ideas-hero__copy">
            <h1 id="postcard-ideas-title" className="ideas-hero__title">{t("pages.postcardIdeas.title")}</h1>
            <p className="ideas-hero__description">{t("pages.postcardIdeas.description")}</p>
            <div className="ideas-hero__actions">
              {project ? (<SavedProjectNotice compact className="postcard-saved-project" label={t("projects.saved.postcards.label")} name={project.name} status={t("projects.saved.postcards.status")} description={t("projects.saved.postcards.count", { count: project.postcards.length })} onContinue={onOpenEditor} onNew={onNew}/>) : (<button type="button" className="public-button public-button--pill" onClick={onOpenEditor}>{t("pages.postcardIdeas.createAction")}<ArrowRight size={19} aria-hidden="true"/>
                </button>)}
            </div>
          </div>
          <div className="ideas-hero__art">
            <img src={assetUrl(postcardIdeasHeroArtwork.src)} width={postcardIdeasHeroArtwork.width} height={postcardIdeasHeroArtwork.height} alt="" draggable={false} fetchPriority="high"/>
          </div>
        </section>
        <BowDivider className="ideas-divider"/>
        <section aria-labelledby="postcard-inspiration-title">
          <h2 id="postcard-inspiration-title" className="ideas-section-title">{t("pages.postcardIdeas.sectionTitle")}</h2>
          <ul className="ideas-grid postcard-ideas-grid" role="list">
            {postcardIdeas.map((idea) => (<li key={idea.artwork.id} className="idea-card idea-card--static">
                <article aria-labelledby={`${idea.artwork.id}-title`}>
                  <div className="idea-card__art">
                    <img src={assetUrl(idea.artwork.src)} width={idea.artwork.width} height={idea.artwork.height} alt={idea.imageDescription} loading="lazy" decoding="async" draggable={false}/>
                  </div>
                  <div className="idea-card__body">
                    <h3 className="idea-card__title" id={`${idea.artwork.id}-title`}>
                      {idea.title}
                    </h3>
                    <p className="idea-card__description">{idea.description}</p>
                  </div>
                </article>
              </li>))}
          </ul>
          <div className="postcard-ideas-create">
            <button type="button" className="public-button public-button--pill" onClick={onOpenEditor}>{t("pages.postcardIdeas.createAction")}<ArrowRight size={19} aria-hidden="true"/>
            </button>
          </div>
        </section>
      </main>
    </SiteLayout>);
}
