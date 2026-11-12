import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/app.css';
import App from './app/App';
import './styles/public-pages.css';
import './styles/shared-ui.css';
import { getLocale, t } from './i18n';

document.documentElement.lang = getLocale();
document.title = t('metadata.title');
document.querySelector('meta[name="description"]')?.setAttribute('content', t('metadata.description'));

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
