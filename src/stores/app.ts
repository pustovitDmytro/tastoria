import { createContextId } from '@builder.io/qwik';

export interface ApplicationStore {
  isMenuOpened: boolean,
  language: string,
}

export default createContextId<ApplicationStore>('Application');
