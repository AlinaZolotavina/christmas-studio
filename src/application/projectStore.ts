import { executeCommand } from '../domain/commands';
import type { Command } from '../domain/commands';
import { createProject } from '../domain/project';
import type { ProjectDocument } from '../domain/types';
import { ProjectRepository } from '../infrastructure/storage/repository';
import type { StorageAdapter } from '../infrastructure/storage/repository';
import { validateProject } from '../infrastructure/storage/schema';
import { EditorStore } from './editorStore';
import type { EditorStoreState } from './editorStore';
export type { SaveStatus } from './editorStore';
export type ProjectStoreState = EditorStoreState<ProjectDocument>;

/** Backward-compatible facade for tag documents and their existing persisted schema. */
export class ProjectStore extends EditorStore<ProjectDocument, Command> {
  constructor(storage: StorageAdapter | null) {
    super(new ProjectRepository(storage), {
      validate: validateProject, execute: executeCommand,
      cardIds: project => project.cards.map(card => card.id),
      typingKey: command => command.type === 'update-text' && command.scope !== 'all' && Object.keys(command.patch).length === 1 && typeof command.patch.content === 'string' ? command.cardId : null,
    });
  }
  create = (templateId: string, count: 24 | 31) => this.replaceProject(() => createProject(templateId, count));
}
