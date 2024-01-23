import { createContextId } from '@builder.io/qwik';

export interface SessionStore {
  user: any
}

export default createContextId<SessionStore>('Session');
