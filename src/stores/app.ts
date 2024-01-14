import { createContextId } from '@builder.io/qwik';

export interface ApplicationStore {
  isMenuOpened: boolean,
  language: string,
}

export const appContext = createContextId<ApplicationStore>('Application');
