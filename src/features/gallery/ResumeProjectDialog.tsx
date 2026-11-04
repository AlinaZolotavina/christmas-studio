import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Controls';

export function ResumeProjectDialog({ product, name, onContinue, onNew }: { product: 'tags' | 'postcards'; name: string; onContinue: () => void; onNew: () => void }) {
  return <Modal title={product === 'postcards' ? 'Продолжить работу над открытками?' : 'Продолжить работу над адвент-тегами?'} onClose={onNew} footer={<><Button variant="secondary" onClick={onNew}>Начать новый</Button><Button onClick={onContinue}>Продолжить</Button></>}>
    <p className="muted">В браузере сохранён проект «{name}». Выбор нового шаблона не заменит его без подтверждения.</p>
  </Modal>;
}
