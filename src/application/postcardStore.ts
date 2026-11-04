import { EditorStore } from './editorStore';
import { executePostcardCommand } from '../domain/postcards/commands';
import type { PostcardCommand } from '../domain/postcards/commands';
import { createPostcardProject } from '../domain/postcards/project';
import type { CreatePostcardProjectOptions, PostcardProject } from '../domain/postcards/types';
import { DocumentRepository, POSTCARD_STORAGE_KEYS } from '../infrastructure/storage/repository';
import type { StorageAdapter } from '../infrastructure/storage/repository';
import { decodePostcardProject, repairPostcardProject, validatePostcardProject } from '../infrastructure/storage/postcardSchema';

export class PostcardStore extends EditorStore<PostcardProject, PostcardCommand> {
  constructor(storage: StorageAdapter | null) {
    super(new DocumentRepository(storage, POSTCARD_STORAGE_KEYS, { decode: decodePostcardProject, repair: repairPostcardProject }), {
      validate: validatePostcardProject, execute: executePostcardCommand,
      cardIds: project => project.postcards.map(card => card.id),
      typingKey: command => command.type === 'update-element' && Object.keys(command.patch).length === 1 && 'content' in command.patch && typeof command.patch.content === 'string' ? `${command.postcardId}:${command.elementId}` : null,
    });
  }
  /** The UI supplies replace:true only after confirming replacement of an existing project. */
  create = (options: CreatePostcardProjectOptions, confirmation: { replace?: boolean } = {}) => this.replaceProject(() => createPostcardProject(options), confirmation.replace === true);
  selectPostcard = (postcardId: string) => {
    const project = this.getSnapshot().project;
    if (!project || !project.postcards.some(card => card.id === postcardId)) return this.reportFailure('Открытка не найдена.');
    if (project.activePostcardId === postcardId) return { changed: false, changedCardIds: [], warnings: [], skippedCardIds: [] };
    return this.updateUiProject({ ...project, activePostcardId: postcardId });
  };
}
