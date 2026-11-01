import { useState } from 'react';
import type { ProjectDocument } from '../domain/types';
import { assets } from '../content/assets';
import { getTemplate } from '../content/templates';
import { TemplateGallery } from '../features/gallery/TemplateGallery';
import { previewCard } from '../features/gallery/previewCard';
import { StudioShell } from '../features/editor/StudioShell';

// T02 integrates the visual shell; the document store replaces this local fixture in T05.
export default function App() {
  const [project, setProject] = useState<ProjectDocument | null>(null);
  const [view, setView] = useState<'gallery' | 'editor'>('gallery');
  const create = (templateId: string, cardCount: 24 | 31) => {
    const template = getTemplate(templateId);
    setProject({ schemaVersion: 1, id: crypto.randomUUID(), name: 'Мой маленький праздник', templateId, cardCount, holeEnabled: true, cards: Array.from({ length: cardCount }, (_, index) => ({ ...previewCard(template, index + 1, assets[index % assets.length].id), id: crypto.randomUUID() })) });
    setView('editor');
  };
  if (view === 'editor' && project) return <StudioShell project={project} onChangeProject={setProject} onHome={() => setView('gallery')} saveStatus="saving" />;
  return <TemplateGallery onCreate={create} onContinue={project ? () => setView('editor') : undefined} />;
}
