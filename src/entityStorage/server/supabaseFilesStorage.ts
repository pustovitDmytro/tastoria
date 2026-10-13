import type { SupabaseClient } from '@supabase/supabase-js';
import type { FilesStorageServer } from '../types';
import { createSupabaseClient } from './supabaseClient';

const IMAGES_BUCKET = 'recipe-images';
const SIGNED_URL_TTL_SECONDS = 3600;

export default class SupabaseFilesStorage implements FilesStorageServer {
    private _client: SupabaseClient;

    constructor({ env }) {
        this._client = createSupabaseClient(env);
    }

    async getImageUrl(userId: string, imageName: string): Promise<string> {
        const { data, error } = await this._client.storage
            .from(IMAGES_BUCKET)
            .createSignedUrl(`${userId}/${imageName}`, SIGNED_URL_TTL_SECONDS);

        if (error) throw new Error(error.message);

        return data.signedUrl;
    }

    async saveImage(userId: string, imageName: string, data: Blob | ArrayBuffer, contentType?: string): Promise<void> {
        const { error } = await this._client.storage
            .from(IMAGES_BUCKET)
            .upload(`${userId}/${imageName}`, data, { upsert: true, contentType });

        if (error) throw new Error(error.message);
    }
}
