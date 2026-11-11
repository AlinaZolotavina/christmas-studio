import { t } from '../../i18n';
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
        title: t("pages.tagIdeas.items.ribbon.title"),
        description: t("pages.tagIdeas.items.ribbon.description"),
        imageDescription: t("pages.tagIdeas.items.ribbon.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.twine,
        title: t("pages.tagIdeas.items.twine.title"),
        description: t("pages.tagIdeas.items.twine.description"),
        imageDescription: t("pages.tagIdeas.items.twine.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.tape,
        title: t("pages.tagIdeas.items.tape.title"),
        description: t("pages.tagIdeas.items.tape.description"),
        imageDescription: t("pages.tagIdeas.items.tape.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.waxSeal,
        title: t("pages.tagIdeas.items.waxSeal.title"),
        description: t("pages.tagIdeas.items.waxSeal.description"),
        imageDescription: t("pages.tagIdeas.items.waxSeal.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.clothespin,
        title: t("pages.tagIdeas.items.clothespin.title"),
        description: t("pages.tagIdeas.items.clothespin.description"),
        imageDescription: t("pages.tagIdeas.items.clothespin.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.clip,
        title: t("pages.tagIdeas.items.clip.title"),
        description: t("pages.tagIdeas.items.clip.description"),
        imageDescription: t("pages.tagIdeas.items.clip.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.corners,
        title: t("pages.tagIdeas.items.corners.title"),
        description: t("pages.tagIdeas.items.corners.description"),
        imageDescription: t("pages.tagIdeas.items.corners.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.glue,
        title: t("pages.tagIdeas.items.glue.title"),
        description: t("pages.tagIdeas.items.glue.description"),
        imageDescription: t("pages.tagIdeas.items.glue.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.ring,
        title: t("pages.tagIdeas.items.ring.title"),
        description: t("pages.tagIdeas.items.ring.description"),
        imageDescription: t("pages.tagIdeas.items.ring.imageAlt"),
    },
    {
        artwork: tagIdeasArtwork.elastic,
        title: t("pages.tagIdeas.items.elastic.title"),
        description: t("pages.tagIdeas.items.elastic.description"),
        imageDescription: t("pages.tagIdeas.items.elastic.imageAlt"),
    },
];
export function TagIdeasPage({ project, onOpenEditor, onNew, }: {
    project: ProjectDocument | null;
    onOpenEditor: () => void;
    onNew: () => void;
}) {
    return (<SiteLayout current="ideas" hasProject={Boolean(project)}>
      <main className="ideas-page tag-ideas-page">
        <a className="ideas-back-link" href="#ideas">
          <ArrowLeft size={17} aria-hidden="true"/>{t("pages.tagIdeas.back")}</a>
        <section className="ideas-hero" aria-labelledby="tag-ideas-title">
          <div className="ideas-hero__copy">
            <h1 id="tag-ideas-title" className="ideas-hero__title">{t("pages.tagIdeas.title")}</h1>
            <p className="ideas-hero__description">{t("pages.tagIdeas.description")}</p>
            <div className="ideas-hero__actions">
              {project ? (<SavedProjectNotice compact className="tag-saved-project" label={t("projects.saved.tags.label")} name={project.name} status={t("projects.saved.tags.status")} description={t("projects.saved.tags.count", { count: project.cardCount })} onContinue={onOpenEditor} onNew={onNew}/>) : (<button type="button" className="public-button public-button--pill" onClick={onOpenEditor}>{t("pages.tagIdeas.createAction")}<ArrowRight size={19} aria-hidden="true"/>
                </button>)}
            </div>
          </div>
          <div className="ideas-hero__art">
            <img src={assetUrl(tagIdeasHeroArtwork.src)} width={tagIdeasHeroArtwork.width} height={tagIdeasHeroArtwork.height} alt="" draggable={false} fetchPriority="high"/>
          </div>
        </section>
        <BowDivider className="ideas-divider"/>
        <section aria-labelledby="tag-inspiration-title">
          <h2 id="tag-inspiration-title" className="ideas-section-title">{t("pages.tagIdeas.sectionTitle")}</h2>
          <ul className="ideas-grid tag-ideas-grid" role="list">
            {tagIdeas.map((idea) => (<li key={idea.artwork.id} className="idea-card idea-card--static">
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
          <div className="tag-ideas-create">
            <button type="button" className="public-button public-button--pill" onClick={onOpenEditor}>{t("pages.tagIdeas.createAction")}<ArrowRight size={19} aria-hidden="true"/>
            </button>
          </div>
        </section>
      </main>
    </SiteLayout>);
}
