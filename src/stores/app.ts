import { createContextId } from '@builder.io/qwik';

export interface ApplicationStore {
  isMenuOpened: boolean,
  language: string,
  toasts: {
    [key: string]: {
      id: string,
      type: 'error' | 'success',
      text: string,
      time?: Date
    };
  }
}

export default createContextId<ApplicationStore>('Application');
