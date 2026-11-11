import { t } from '../../i18n';
import { ArrowRight } from "lucide-react";
import { assetUrl, getAsset } from "../../content/assets";
import { ideasArtwork } from "../../data/site-art";
import { SiteLayout } from "../../shared/layout/SiteLayout";
import { BowDivider } from "../../shared/ui/BowDivider";
import "./ideas-page.css";
const heroArtwork = getAsset("elf-pair-decorating-christmas-gift");
const topics = [
    {
        id: "advent-tags",
        href: "#ideas/tags",
        artwork: ideasArtwork.tags,
        title: <>{t("pages.ideas.tags.title")}</>,
        description: t("pages.ideas.tags.description"),
    },
    {
        id: "postcards",
        href: "#ideas/postcards",
        artwork: ideasArtwork.postcards,
        title: <>{t("pages.ideas.postcards.title")}</>,
        description: t("pages.ideas.postcards.description"),
    },
];
export function IdeasPage({ hasProject }: {
    hasProject: boolean;
}) {
    return (<SiteLayout current="ideas" hasProject={hasProject}>
      <main className="ideas-page">
        <section className="ideas-hero" aria-labelledby="ideas-title">
          <div className="ideas-hero__copy">
            <h1 id="ideas-title" className="ideas-hero__title">{t("pages.ideas.title")}</h1>
            <p className="ideas-hero__description">{t("pages.ideas.description")}</p>
          </div>
          <div className="ideas-hero__art">
            <img src={assetUrl(heroArtwork.print)} width={heroArtwork.width} height={heroArtwork.height} alt="" draggable={false} fetchPriority="high"/>
          </div>
        </section>

        <BowDivider className="ideas-divider"/>

        <section className="ideas-grid" aria-label={t("pages.ideas.topicsLabel")}>
          {topics.map((topic) => {
            const content = (<>
                <div className="idea-card__art">
                  <img src={assetUrl(topic.artwork.src)} width={topic.artwork.width} height={topic.artwork.height} alt="" loading="lazy" decoding="async" draggable={false}/>
                </div>
                <div className="idea-card__body">
                  <h2 className="idea-card__title" id={`idea-${topic.id}`}>
                    {topic.title}
                  </h2>
                  <p className="idea-card__description">{topic.description}</p>
                  <span className="idea-card__arrow" aria-hidden="true">
                    <ArrowRight size={24} strokeWidth={1.5}/>
                  </span>
                </div>
              </>);
            return (<article className="idea-card" key={topic.id} aria-labelledby={`idea-${topic.id}`}>
                {topic.href ? (<a className="idea-card__link" href={topic.href} aria-labelledby={`idea-${topic.id}`}>
                    {content}
                  </a>) : (content)}
              </article>);
        })}
        </section>
      </main>
    </SiteLayout>);
}
