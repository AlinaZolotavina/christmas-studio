import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { markTourOffered } from './preferences';
import { tourSteps } from './steps';
import { positionTourPanel } from './position';
import './tour.css';

export function TourOffer({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  const skip = () => { markTourOffered(); onSkip(); };
  const start = () => { markTourOffered(); onStart(); };
  return <Modal className="tour-offer" title="Познакомимся с мастерской?" onClose={skip} footer={<><Button variant="secondary" onClick={skip}>Пропустить</Button><Button onClick={start}>Начать знакомство <ArrowRight size={16} /></Button></>}><div className="tour-offer__intro"><span><Sparkles size={30} strokeWidth={1.3} /></span><p>Пять небольших подсказок покажут, как редактировать карточки, менять весь набор и подготовить PDF к печати.</p><p className="muted">Можно начать творить сразу. Тур всегда доступен заново в справке.</p></div></Modal>;
}

/** Every mount is a full replay from step one; no automatic start or persisted partial progress. */
export function TourDialog({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [target, setTarget] = useState<DOMRect | null>(null);
  const [viewport, setViewport] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const content = useRef<HTMLDivElement>(null);
  const progressId = useId();
  const step = tourSteps[index];
  useEffect(() => {
    const update = () => {
      const visible = step.target.split(',').flatMap(selector => [...document.querySelectorAll<HTMLElement>(selector.trim())]).find(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && getComputedStyle(element).display !== 'none';
      });
      setTarget(visible?.getBoundingClientRect() ?? null);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    let frame = 0;
    const scheduleUpdate = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    // Breakpoint changes replace the strip/footer with tabs after the resize event.
    // Re-read selectors after that render so the highlight follows the new control.
    const observer = new MutationObserver(scheduleUpdate);
    const studio = document.querySelector('.studio');
    if (studio) observer.observe(studio, { childList: true, subtree: true });
    update();
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', scheduleUpdate); window.removeEventListener('scroll', scheduleUpdate, true); window.visualViewport?.removeEventListener('resize', scheduleUpdate); };
  }, [step]);
  useEffect(() => { content.current?.parentElement?.scrollTo({ top: 0 }); }, [index]);
  const position = positionTourPanel(target, viewport);
  const style = { '--tour-left': `${position.left}px`, '--tour-top': `${position.top}px`, '--tour-width': `${position.width}px`, '--tour-height': `${position.height}px` } as CSSProperties;

  return <div className="onboarding-tour-root" style={style}>{target && <div aria-hidden="true" className="onboarding-highlight" style={{ left: target.left + 3, top: target.top + 3, width: Math.max(0, target.width - 6), height: Math.max(0, target.height - 6) }} />}<Modal overlayClassName="tour-overlay" className="onboarding-tour" title={step.title} onClose={onClose} footer={<><Button variant="quiet" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>Назад</Button><Button onClick={() => { if (index === tourSteps.length - 1) onClose(); else setIndex(value => value + 1); }}>{index === tourSteps.length - 1 ? <>Будем творить <Check size={16} /></> : <>Дальше <ArrowRight size={16} /></>}</Button></>}><div className="onboarding-tour__step" aria-live="polite" ref={content}><div className="onboarding-tour__paragraphs">{step.paragraphs.map(paragraph => <p key={paragraph}>{paragraph.split(/(\*\*.+?\*\*)/g).map((part, partIndex) => part.startsWith('**') ? <strong key={partIndex}>{part.slice(2, -2)}</strong> : part)}</p>)}</div><div className="onboarding-tour__progress"><span id={progressId} className="onboarding-tour__count">Шаг {index + 1} из {tourSteps.length}</span><div className="tour-progress" role="progressbar" aria-labelledby={progressId} aria-valuemin={1} aria-valuemax={tourSteps.length} aria-valuenow={index + 1}>{tourSteps.map((_, item) => <span key={item} className={item <= index ? 'is-done' : ''} />)}</div></div></div></Modal></div>;
}
