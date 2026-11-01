import { useState } from 'react';
import { Check, Layers2 } from 'lucide-react';
import type { Card, ProjectDocument, Shape } from '../../domain/types';
import type { Command, OperationResult } from '../../domain/commands';
import { Button, Field } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import { NumberField } from './Inspector';

export function ProjectSettings({ project, card, onCommand, onClose }: { project: ProjectDocument; card: Card; onCommand: (command: Command) => OperationResult; onClose: () => void }) {
  const [name, setName] = useState(project.name);
  const [shape, setShape] = useState<Shape>(card.shape);
  const [width, setWidth] = useState(card.width);
  const [height, setHeight] = useState(card.height);
  const [confirmGeometry, setConfirmGeometry] = useState(false);
  const [renameError, setRenameError] = useState('');
  const rename = () => {
    if (name === project.name) return true;
    const result = onCommand({ type: 'rename-project', name: name.trim() });
    setRenameError(result.error ?? '');
    return !result.error;
  };
  const finish = () => { if (rename()) onClose(); };
  return <><Modal title="Настройки проекта" onClose={finish} footer={<Button onClick={finish}>Готово <Check size={16} /></Button>}><div className="settings-form"><Field label="Название проекта"><input aria-label="Название проекта" value={name} onChange={(event) => setName(event.target.value)} onBlur={rename} maxLength={120} />{renameError && <span className="field__hint danger-link">{renameError}</span>}</Field><div className="project-summary"><Layers2 size={22} /><div><strong>{project.cardCount} карточки</strong><p>Количество и шаблон выбраны при создании</p></div></div><Field label="Форма карточек"><select value={shape} onChange={(event) => setShape(event.target.value as Shape)}><option value="tag">Бирка</option><option value="rectangle">Прямоугольник</option><option value="square">Квадрат</option><option value="circle">Круг</option><option value="oval">Овал</option></select></Field><div className="number-grid"><NumberField label={shape === 'circle' ? 'Диаметр' : shape === 'square' ? 'Сторона' : 'Ширина карточек'} value={width / 10} min={0.5} max={29.7} unit="см" onCommit={(value) => setWidth(value * 10)} />{shape !== 'circle' && shape !== 'square' && <NumberField label="Высота карточек" value={height / 10} min={0.5} max={29.7} unit="см" onCommit={(value) => setHeight(value * 10)} />}</div><Button variant="secondary" onClick={() => setConfirmGeometry(true)}>Изменить геометрию всего набора</Button><div className="toggle-row"><div><h3>Отверстия для ленты</h3><p className="field__hint">Добавить или убрать во всём наборе</p></div><label className="toggle"><input type="checkbox" aria-label="Отверстия для ленты во всём проекте" checked={project.holeEnabled} onChange={(event) => onCommand({ type: 'set-project-hole', enabled: event.target.checked })} /><span /></label></div><p className="muted">Форма и размеры применяются ко всем карточкам. Отдельную карточку можно настроить во вкладке «Фон».</p></div></Modal>{confirmGeometry && <Modal title="Изменить все карточки?" onClose={() => setConfirmGeometry(false)} footer={<><Button variant="secondary" onClick={() => setConfirmGeometry(false)}>Отмена</Button><Button onClick={() => { const result = onCommand({ type: 'resize-card', cardId: card.id, scope: 'all', patch: { shape, width, height } }); if (!result.error) setConfirmGeometry(false); }}>Применить ко всему набору</Button></>}><p className="muted">Элементы пропорционально изменят размеры и положение. Возможны переполнение текста и выход элементов за границы. После применения весь набор будет проверен. Изменение можно отменить целиком.</p></Modal>}</>;
}
