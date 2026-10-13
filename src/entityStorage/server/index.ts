import type { EntityStorageServer, FilesStorageServer } from '../types';
import FirebaseEntityStorage from './firebaseDriver';
import SupabaseEntityStorage from './supabaseDriver';
import FirebaseFilesStorage from './firebaseFilesStorage';
import SupabaseFilesStorage from './supabaseFilesStorage';
import config, { getDataDriver } from '~/config';

export function createEntityStorage({ env }): EntityStorageServer {
    if (getDataDriver(env) === 'supabase') {
        return new SupabaseEntityStorage({ env });
    }

    return new FirebaseEntityStorage({ env });
}

export function createFilesStorage({ env }): FilesStorageServer {
    if (config.storage.files === 'supabase') {
        return new SupabaseFilesStorage({ env });
    }

    return new FirebaseFilesStorage({ env });
}
