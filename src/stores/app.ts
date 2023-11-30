import { createContextId } from '@builder.io/qwik';

export interface ApplicationStore {
  isMenuOpened: boolean
}

export const appContext = createContextId<ApplicationStore>('Application');
