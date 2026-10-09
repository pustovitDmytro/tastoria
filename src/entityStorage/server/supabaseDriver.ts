import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { EntityStorageServer } from '../types';
import { getSupabaseConfig } from '~/config';
import { dumpRecipe } from '~/utils/dumpUtils';
import { planRecipesSync } from '~/utils/sync';
import type { compareResult, dbResult } from '~/utils/sync';
import type { Recipe } from '~/types';
import logger from '~/logger';

const RECIPES_TABLE = 'recipes';
const IMAGES_BUCKET = 'recipe-images';
const SIGNED_URL_TTL_SECONDS = 3600;

export default class SupabaseEntityStorage implements EntityStorageServer {
    private _client: SupabaseClient;

    constructor({ env }) {
        const { url, serviceKey } = getSupabaseConfig(env);

        this._client = createClient(url, serviceKey, {
            auth : { persistSession: false, autoRefreshToken: false }
        });
    }

    // Auth stays on Firebase; supabase driver is data-only, so there is no user to resolve here
    async signIn(): Promise<null> {
        return null;
    }

    async downloadRecipe(userId: string, recipeId: string): Promise<Recipe | null> {
        const { data, error } = await this._client
            .from(RECIPES_TABLE)
            .select('data')
            .eq('user_id', userId)
            .eq('id', recipeId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!data) return null;

        return dumpRecipe(data.data);
    }

    async downloadRecipes(userId: string): Promise<Recipe[]> {
        const { data, error } = await this._client
            .from(RECIPES_TABLE)
            .select('data')
            .eq('user_id', userId);

        if (error) throw new Error(error.message);

        return data.map(r => dumpRecipe(r.data));
    }

    async syncUserRecipes(userId: string, recipes: Recipe[]): Promise<compareResult[]> {
        const syncId = `${userId}_${Date.now()}`;

        try {
            logger.info(`RECIPES_SYNC_STARTED ${syncId}`);

            const remoteRecipes = await this.downloadRecipes(userId);
            const inDBMapping = {} as dbResult;

            for (const remote of remoteRecipes) inDBMapping[remote.id] = remote;

            const results = planRecipesSync(inDBMapping, recipes);
            const toUpload = results.filter(r => [ 'ADD_REMOTE', 'UPDATE_REMOTE' ].includes(r.type));

            if (toUpload.length > 0) {
                /* eslint-disable camelcase */
                const rows = toUpload.map(r => ({
                    user_id    : userId,
                    id         : r.recipe.id,
                    data       : r.recipe,
                    updated_at : r.recipe.updatedAt || (new Date()).toISOString()
                }));
                /* eslint-enable camelcase */

                const { error } = await this._client.from(RECIPES_TABLE).upsert(rows);

                if (error) throw new Error(error.message);
            }

            const updates = results.filter(r => ![ 'KEEP', 'CANT_COMPARE' ].includes(r.type));

            logger.info(`RECIPES_SYNC_FINISHED ${syncId} (${updates.length})`);

            return results;
        } catch (error) {
            logger.error(`RECIPES_SYNC_FAILED ${syncId}`);
            if (error instanceof Error) {
                logger.error({ error: error.toString(), stack: error.stack });
            }

            return [];
        }
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
