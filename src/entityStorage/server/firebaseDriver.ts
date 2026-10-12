import type { EntityStorageServer } from '../types';
import FireBaseServer from '~/firebase/server';
import type { Recipe } from '~/types';
import type { compareResult } from '~/utils/sync';

export default class FirebaseEntityStorage implements EntityStorageServer {
    private _server: FireBaseServer;

    constructor({ env }) {
        this._server = new FireBaseServer({ env });
    }

    signIn(token?: string | null) {
        return this._server.signIn(token);
    }

    downloadRecipe(userId: string, recipeId: string): Promise<Recipe | null> {
        return this._server.downloadRecipe(userId, recipeId);
    }

    downloadRecipes(userId: string): Promise<Recipe[]> {
        return this._server.downloadRecipes(userId);
    }

    syncUserRecipes(userId: string, recipes: Recipe[]): Promise<compareResult[]> {
        return this._server.syncUserRecipes(userId, recipes);
    }

    getImageUrl(userId: string, imageName: string): Promise<string> {
        return this._server.getImageUrl(userId, imageName);
    }

    saveImage(userId: string, imageName: string, data: Blob | ArrayBuffer): Promise<void> {
        return this._server.saveImage(userId, imageName, data);
    }
}
