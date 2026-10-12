import { isEqual, isAfter } from 'date-fns';
import type { Recipe } from '~/types';

export interface compareResult {
    type: 'KEEP' | 'UPDATE_REMOTE' | 'UPDATE_LOCAL' | 'CANT_COMPARE' | 'ADD_REMOTE' | 'ADD_LOCAL' |'DELETE_REMOTE',
    recipe: Recipe
}

export interface dbResult {
    [key: string]: Recipe;
}

export function planRecipesSync(inDBMapping: dbResult, localRecipes: Recipe[]): compareResult[] {
    const results = [] as compareResult[];
    const checked = new Set();

    for (const localRecipe of localRecipes) {
        const remoteRecipe = inDBMapping[localRecipe.id];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (remoteRecipe) {
            results.push(compareRecipes(remoteRecipe, localRecipe));
        } else if (!localRecipe.deletedAt) {
            results.push({ type: 'ADD_REMOTE', recipe: localRecipe });
        }

        checked.add(localRecipe.id);
    }

    for (const remoteRecipe of Object.values(inDBMapping)) {
        if (!checked.has(remoteRecipe.id)) results.push({ type: 'ADD_LOCAL', recipe: remoteRecipe });
    }

    return results;
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
