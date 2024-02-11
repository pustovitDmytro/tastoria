import { isEqual, isAfter } from 'date-fns';
import type { Recipe } from '~/types';

export interface compareResult {
    type: 'KEEP' | 'UPDATE_REMOTE' | 'UPDATE_LOCAL' | 'CANT_COMPARE' | 'ADD_REMOTE' | 'ADD_LOCAL' |'DELETE_REMOTE',
    recipe: Recipe
}

export interface dbResult {
    [key: string]: Recipe;
}

export function compareRecipes(remoteRecipe:Recipe, localRecipe:Recipe):compareResult {
    const localDate = localRecipe.updatedAt;
    const remoteDate = remoteRecipe.updatedAt;

    if (isEqual(localDate, remoteDate)) {
        return { type: 'KEEP', recipe: localRecipe };
    }

    if (isAfter(localDate, remoteDate)) {
        return { type: 'UPDATE_REMOTE', recipe: localRecipe };
    }

    if (isAfter(remoteDate, localDate)) {
        return { type: 'UPDATE_LOCAL', recipe: remoteRecipe };
    }

    return { type: 'CANT_COMPARE', recipe: localRecipe };
}
