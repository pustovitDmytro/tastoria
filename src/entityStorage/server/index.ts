import type { EntityStorageServer } from '../types';
import FirebaseEntityStorage from './firebaseDriver';
import SupabaseEntityStorage from './supabaseDriver';
import config from '~/config';

export function createEntityStorage({ env }): EntityStorageServer {
    if (config.storage.driver === 'supabase') {
        return new SupabaseEntityStorage({ env });
    }

    return new FirebaseEntityStorage({ env });
}
