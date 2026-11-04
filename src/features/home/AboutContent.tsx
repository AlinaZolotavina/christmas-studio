import { useState } from "react";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { siteContacts } from "../../content/siteContacts";
import { ArtworkPlaceholder } from "../../shared/ui/ArtworkPlaceholder";
import { Button } from "../../shared/ui/Controls";
import { Modal } from "../../shared/ui/Modal";
import { BowDivider } from "../../shared/ui/BowDivider";
import "./about-content.css";

const products = [
  {
    id: "tags",
    name: "Адвент-теги",
    kind: "tag",
    slot: "product-tags-cover",
    soon: false,
  },
  {
    id: "postcards",
    name: "Открытки",
    kind: "postcard",
    slot: "product-postcards-cover",
    soon: false,
  },
  {
    id: "stickers",
    name: "Стикеры",
    kind: "sticker",
    slot: "product-stickers-cover",
    soon: true,
  },
] as const;

export function AboutContent() {
  const [feedbackNotice, setFeedbackNotice] = useState(false);
  const email = `mailto:${siteContacts.authorEmail}`;
  return (
    <article className="about-project about-overview">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-heading">
          <div className="about-heading__copy">
            <h1 id="about-title">О проекте</h1>
          </div>
          <ArtworkPlaceholder
            kind="branch"
            slot="about-hero-branch"
            className="about-heading__art"
          />
        </div>
        <ArtworkPlaceholder
          kind="gift"
          slot="about-gift"
          className="about-story__art"
        />
        <div className="about-story__copy">
          <p>
            Я создала это пространство, чтобы подготовка{' '}
            <br />к праздникам стала проще, приятнее и немного волшебнее.
            <br />
            Мне хотелось собрать всё необходимое для создания красивых
            праздничных мелочей в одном месте.
          </p>
          <p>
            Здесь можно создавать адвент-теги и открытки, выбирать
            иллюстрации и фоны, сочетать цвета и добавлять собственные надписи.
            Для адвент-тегов есть готовые наборы, для открыток — чистые форматы
            A6 и квадрат, которые можно оформить по-своему.
          </p>
          <p>
            В одном проекте можно собрать до 20 разных открыток с текстом,
            рисунками и декоративными надписями. Готовые открытки скачиваются
            в PDF для печати или как изображения PNG и JPG с разрешением
            300 DPI. Набор изображений сохраняется в ZIP-архиве.
          </p>
          <p>
            <strong>
              Проект полностью бесплатный и не требует регистрации.
            </strong>{" "}
            Никаких аккаунтов, подписок и скрытых платежей — создавайте дизайны
            прямо в браузере, скачивайте и распечатывайте их.
          </p>
          <p>
            Я также ценю вашу приватность: редактор не требует предоставления
            личных данных, а созданные вами дизайны не сохраняются на моих
            серверах.
          </p>
          <p>
            Создавайте что-то своё, делитесь теплом и добавляйте немного
            праздничного волшебства в обычные вещи!
          </p>
        </div>
      </section>
      <BowDivider className="about-divider" />
      <section
        className="about-products"
        aria-labelledby="about-products-title"
      >
        <h2 id="about-products-title">Что можно создать</h2>
        <div className="about-product-grid">
          {products.map((product) => (
            <a
              key={product.id}
              href={`#${product.id}`}
              className={`about-product about-product--${product.id}`}
              data-product={product.id}
            >
              <div className="about-product__art">
                <ArtworkPlaceholder kind={product.kind} slot={product.slot} />
              </div>
              <div className="about-product__caption">
                <div>
                  <h3>{product.name}</h3>
                  {product.soon && <span>В разработке</span>}
                </div>
                <ArrowRight size={19} aria-hidden="true" />
              </div>
            </a>
          ))}
        </div>
      </section>
      <section
        className="about-feedback"
        aria-labelledby="about-feedback-title"
      >
        <ArtworkPlaceholder
          kind="envelope"
          slot="about-feedback-envelope"
          className="about-feedback__art"
        />
        <div className="about-feedback__copy">
          <h2 id="about-feedback-title">Буду рада вашим идеям и отзывам!</h2>
          <p>
            Нашли ошибку, хотите предложить улучшение или просто поделиться
            впечатлением? Напишите мне.
          </p>
          <div className="about-feedback__actions">
            {siteContacts.feedbackUrl ? (
              <a
                className="public-button"
                href={siteContacts.feedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={19} /> Оставить отзыв
              </a>
            ) : (
              <button
                type="button"
                className="public-button"
                onClick={() => setFeedbackNotice(true)}
              >
                <MessageCircle size={19} /> Оставить отзыв
              </button>
            )}
            <a className="public-button about-feedback__email" href={email}>
              <Mail size={19} /> Написать автору
            </a>
          </div>
        </div>
      </section>
      {feedbackNotice && (
        <Modal
          title="Отзывы о мастерской"
          onClose={() => setFeedbackNotice(false)}
          footer={
            <Button onClick={() => setFeedbackNotice(false)}>Понятно</Button>
          }
        >
          <div className="about-feedback-notice">
            <p>
              Ссылка для отзывов появится чуть позже. А пока можно поделиться
              идеей или впечатлением по почте.
            </p>
            <a href={email}>
              <Mail size={18} /> {siteContacts.authorEmail}
            </a>
          </div>
        </Modal>
      )}
    </article>
  );
}
