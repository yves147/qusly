import { observable, action, computed } from 'mobx';
import { extname } from 'path';

import { Session } from './session';
import { Location } from './location';
import { IFile } from '~/interfaces';
import store from '../store';

let id = 0;

export class Page {
  @observable
  public id = id++;

  @observable
  public loading = true;

  @observable
  public files: IFile[] = [];

  @observable
  public focusedFile: IFile;

  public hoveredFile: IFile;

  public path = new Location(this);

  constructor(public session: Session) { }

  public async load(path?: string) {
    await this.path.push(path);
  }

  public async close() {
    const pages = store.pages.list.filter(r => r.session.id === this.session.id);

    if (!pages.length) {
      this.session.close();
    }

    store.pages.list = store.pages.list.filter(r => r !== this);
  }

  @action
  public fetchFiles = async () => {
    this.loading = true;

    const path = this.path.toString();
    const res = await this.session.client.readDir(path);
    if (!res.success) throw res.error;

    await store.icons.load(...res.files);

    this.tab.title = `${this.session.site.title} - ${path}`;
    this.files = res.files || [];
    this.loading = false;
  }

  @computed
  public get tab() {
    return store.tabs.list.find(r => r.pageId === this.id);
  }

  @computed
  public get selectedFiles() {
    return this.files.filter(e => e.selected);
  }

  @action
  public unselectFiles(...skip: IFile[]) {
    this.files.forEach(item => {
      item.selected = skip.indexOf(item) !== -1;
    });
  }

  @action
  public selectGroup(start: number, end: number) {
    if (start > end) [start, end] = [end, start];

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      file.selected = i >= start && i <= end;
    }
  }

  @action
  public async dropRemote() {
    if (this.hoveredFile && this.hoveredFile.type === 'directory' && this.focusedFile !== this.hoveredFile) {
      this.loading = true;

      for (const file of this.selectedFiles) {
        const oldPath = this.path.relative(file.name);
        const newPath = this.path.relative(this.hoveredFile.name, file.name);

        await this.session.client.move(oldPath, newPath);
      }

      await this.fetchFiles();
    }
  }

  @action
  public async rename(file: IFile, newName: string) {
    newName = newName.trim();

    const oldName = file.name;
    const exists = this.files.find(r => r.name.toLowerCase() === newName.toLowerCase());

    if (!exists && newName.length) {
      file.name = newName;
      file.ext = extname(newName);
      file.renamed = false;

      if (file.type !== 'directory') {
        await store.icons.load(file);
      }

      const oldPath = this.path.relative(oldName);
      const newPath = this.path.relative(newName);

      const res = await this.session.client.move(oldPath, newPath);

      if (!res.success) {
        file.name = oldName;
        throw res.error;
      }
    }
  }

  @action
  public async delete(files: IFile[]) {
    this.loading = true;

    for (const file of files) {
      const path = this.path.relative(file.name);

      if (file.type === 'directory') {
        await this.session.client.rimraf(path);
      } else {
        await this.session.client.unlink(path);
      }
    }

    await this.fetchFiles();
  }
}
