import { useEffect, useId, useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { markTourOffered } from './preferences';
import './tour.css';

const steps = [
  { target: '.workspace', eyebrow: 'ВАША ТВОРЧЕСКАЯ ПЛОЩАДКА', title: 'Начните с маленькой истории', text: 'Выберите текст или иллюстрацию на карточке. Перемещайте элемент и меняйте его размер круглыми ручками. Двойной клик по выбранному тексту открывает ввод; Esc завершает его с сохранением.' },
  { target: '.inspector-tabs, .mobile-dock', eyebrow: 'СЛОВА, КРАСКИ И ДЕТАЛИ', title: 'Настроение — в ваших руках', text: 'Справа находятся вкладки «Текст», «Изображение» и «Фон». Ищите иллюстрации на русском или английском, выбирайте фон и добавляйте круги или звёзды. На телефоне настройки открываются кнопками внизу.' },
  { target: '.thumbnail-strip, .mobile-dock', eyebrow: 'ДЕНЬ ЗА ДНЁМ', title: 'У каждого дня своя карточка', text: 'Переключайтесь между карточками в нижней ленте. На телефоне её открывает кнопка «Карточки». Режим «Всему набору» применяет оформление за одно действие; индивидуальные тексты и их положение сохраняются.' },
  { target: '.history-controls', eyebrow: 'МОЖНО СМЕЛО ПРОБОВАТЬ', title: 'Каждую идею можно переиграть', text: 'Кнопки со стрелками отменяют и повторяют до 15 действий. Работают Ctrl/⌘+Z и Ctrl/⌘+Shift+Z вне поля ввода. Проект сохраняется в этом браузере автоматически; после перезагрузки история начинается заново.' },
  { target: '.inspector-footer, .mobile-dock', eyebrow: 'ПОСЛЕДНИЙ ШТРИХ', title: 'Превратите идею в подарок', text: 'Откройте предпросмотр PDF и проверьте все страницы A4. Красные ошибки нужно исправить, оранжевые предупреждения не мешают скачиванию. Печатайте при 100%, отключив «Подогнать под страницу», и вырезайте по пунктиру.' },
];

export function TourOffer({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const skip = () => { markTourOffered(); onSkip(); };
  const start = () => { markTourOffered(); onStart(); };
  return <Modal className="tour-offer" title="Познакомимся с мастерской?" onClose={skip} footer={<><Button variant="secondary" onClick={skip}>Пропустить</Button><Button onClick={start}>Начать знакомство <ArrowRight size={16} /></Button></>}><div className="tour-offer__intro"><span><Sparkles size={30} strokeWidth={1.3} /></span><p>Пять небольших подсказок покажут, как редактировать карточки, менять весь набор и подготовить PDF к печати.</p><p className="muted">Можно начать творить сразу. Тур всегда доступен заново в справке.</p></div></Modal>;
}

/** Every mount is a full replay from step one; no automatic start or persisted partial progress. */
export function TourDialog({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const progressId = useId();
  const step = steps[index];
  useEffect(() => {
    const update = () => {
      const visible = [...document.querySelectorAll<HTMLElement>(step.target)].find(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && getComputedStyle(element).display !== 'none';
      });
      setTarget(visible?.getBoundingClientRect() ?? null);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [step]);

  return <>{target && <div aria-hidden="true" className="onboarding-highlight" style={{ left: target.left + 3, top: target.top + 3, width: Math.max(0, target.width - 6), height: Math.max(0, target.height - 6) }} />}<Modal className="onboarding-tour" title={step.title} onClose={onClose} footer={<><Button variant="quiet" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>Назад</Button><Button onClick={() => { if (index === steps.length - 1) onClose(); else setIndex(value => value + 1); }}>{index === steps.length - 1 ? <>Будем творить <Check size={16} /></> : <>Дальше <ArrowRight size={16} /></>}</Button></>}><div className="onboarding-tour__step" aria-live="polite"><span className="eyebrow">{step.eyebrow}</span><p className="onboarding-tour__description">{step.text}</p><span id={progressId} className="onboarding-tour__count">Шаг {index + 1} из {steps.length}</span><div className="tour-progress" role="progressbar" aria-labelledby={progressId} aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={index + 1}>{steps.map((_, item) => <span key={item} className={item <= index ? 'is-done' : ''} />)}</div></div></Modal></>;
}
