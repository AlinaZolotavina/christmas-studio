import { useState } from 'react';
import { Button } from '../../shared/ui/Controls';
import { Modal } from '../../shared/ui/Modal';
import './terms-dialog.css';

export function TermsDialog({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  const [checked, setChecked] = useState(false);
  return <div className="public-site public-site--dialog"><Modal title="Перед началом работы" className="terms-dialog" onClose={onCancel} footer={<><Button variant="secondary" onClick={onCancel}>Отмена</Button><Button disabled={!checked} onClick={() => { if (checked) onAccept(); }}>Принять и создать проект</Button></>}>
    <p>Редактор бесплатный и не требует регистрации. Ваши дизайны сохраняются локально в браузере.</p>
    <p>Использование материалов допускается только в личных некоммерческих целях.</p>
    <label className="terms-dialog__accept"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} /><span>Я ознакомился(-ась) и согласен(-на) с <a href="#terms" target="_blank" rel="noopener noreferrer">условиями использования</a>.</span></label>
    <p className="terms-dialog__privacy"><a href="#privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a> объясняет, какие данные остаются в браузере и как работает хостинг.</p>
  </Modal></div>;
}
