import { useState } from 'react';
import { Check, Layers2 } from 'lucide-react';
import type { Card, ProjectDocument, Shape } from '../../domain/types';
import type { Command, OperationResult } from '../../domain/commands';
import { Button, Field } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { NumberField } from './Inspector';

export function ProjectSettings({ project, card, onCommand, onClose, onReset }: { project: ProjectDocument; card: Card; onCommand: (command: Command) => OperationResult; onClose: () => void; onReset?: () => void }) {
  const [name, setName] = useState(project.name);
  const [shape, setShape] = useState<Shape>(card.shape);
  const [width, setWidth] = useState(card.width);
  const [height, setHeight] = useState(card.height);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const rename = () => {
    if (name === project.name) return true;
    const result = onCommand({ type: 'rename-project', name: name.trim() });
    setError(result.error ?? ''); return !result.error;
  };
  const finish = () => { if (rename()) onClose(); };
  const applyGeometry = () => {
    const result = onCommand({ type: 'resize-card', cardId: card.id, scope: 'all', patch: { shape, width, height } });
    setError(result.error ?? ''); setApplied(!result.error);
  };
  return <Modal title="Настройки проекта" onClose={finish} footer={<Button onClick={finish}>Готово <Check size={16} /></Button>}><div className="settings-form">
    <Field label="Название проекта"><input aria-label="Название проекта" value={name} onChange={event => setName(event.target.value)} onBlur={rename} maxLength={120} /></Field>
    <div className="project-summary"><Layers2 size={22} /><div><strong>Набор из {project.cardCount} карточек</strong><p>Количество и шаблон выбраны при создании</p></div></div>
    <Field label="Форма карточек"><select aria-label="Форма карточек" value={shape} onChange={event => { setShape(event.target.value as Shape); setApplied(false); }}><option value="tag">Бирка</option><option value="rectangle">Прямоугольник</option><option value="square">Квадрат</option><option value="circle">Круг</option><option value="oval">Овал</option></select></Field>
    <div className="number-grid"><NumberField label={shape === 'circle' ? 'Диаметр' : shape === 'square' ? 'Сторона' : 'Ширина карточек'} value={width / 10} min={0.5} max={29.7} unit="см" onCommit={value => { setWidth(value * 10); setApplied(false); }} />{shape !== 'circle' && shape !== 'square' && <NumberField label="Высота карточек" value={height / 10} min={0.5} max={29.7} unit="см" onCommit={value => { setHeight(value * 10); setApplied(false); }} />}</div>
    <p className="geometry-notice" role="note">Форма и размеры изменятся у всех {project.cardCount} карточек. Элементы будут преобразованы пропорционально — после применения проверьте оформление. Изменение можно отменить.</p>
    <Button variant="secondary" onClick={applyGeometry}>Применить ко всему набору</Button>
    {applied && <p className="field__hint" role="status">Форма и размеры обновлены для всего набора.</p>}
    {error && <p className="project-settings-error" role="alert">{error}</p>}
    <div className="toggle-row"><div><h3>Отверстия для ленты</h3><p className="field__hint">Добавить или убрать во всём наборе</p></div><label className="toggle"><input type="checkbox" aria-label="Отверстия для ленты во всём проекте" checked={project.holeEnabled} onChange={event => onCommand({ type: 'set-project-hole', enabled: event.target.checked })} /><span /></label></div>
    <p className="muted">Отдельную карточку можно настроить во вкладке «Фон».</p>
    {onReset && <button type="button" className="project-reset-link" onClick={onReset}>Сбросить оформление проекта</button>}
  </div></Modal>;
}
