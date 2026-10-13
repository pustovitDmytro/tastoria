import type { Recipe } from '~/types';
import type { compareResult } from '~/utils/sync';

export interface EntityStorageServer {
    signIn(token?: string | null): Promise<object | null>;
    downloadRecipe(userId: string, recipeId: string): Promise<Recipe | null>;
    downloadRecipes(userId: string): Promise<Recipe[]>;
    syncUserRecipes(userId: string, recipes: Recipe[]): Promise<compareResult[]>;
}

export interface FilesStorageServer {
    getImageUrl(userId: string, imageName: string): Promise<string>;
    saveImage(userId: string, imageName: string, data: Blob | ArrayBuffer, contentType?: string): Promise<void>;
}

export interface ImageContext {
    shareToken?: string;
}

export interface FilesStorageUI {
    getImageUrl(userId: string, imageName: string, ctx?: ImageContext): Promise<string>;
    downloadImage(userId: string, imageName: string, ctx?: ImageContext): Promise<Blob>;
    saveImage(user: { id: string }, imageName: string, blob: Blob): Promise<void>;
}
