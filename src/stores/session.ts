import { component$, createContextId, useContextProvider, useStore } from '@builder.io/qwik';

export interface SessionStore {
  user: any
}

export const sessionContext = createContextId<SessionStore>('Session');
