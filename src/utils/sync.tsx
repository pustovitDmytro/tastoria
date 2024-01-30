import { getDatabase, ref as refDB, set, get } from 'firebase/database';
import { isEqual, isAfter } from 'date-fns';

import type { Recipe } from '~/types';

interface compareResult {
    type: 'KEEP' | 'UPDATE_REMOTE' | 'UPDATE_LOCAL' | 'CANT_COMPARE' | 'ADD_REMOTE' | 'ADD_LOCAL' |'DELETE_REMOTE',
    recipe: Recipe
}

interface dbResult {
    [key: string]: Recipe;
}

function compareRecipes(remoteRecipe:Recipe, localRecipe:Recipe):compareResult {
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


export async function syncUserRecipes(userId:string, recipes:Recipe[]):Promise<compareResult[]>  {
    const syncId = `${userId }_${Date.now()}`;

    try {
        console.log('RECIPES_SYNC_STARTED', syncId);

        const db = getDatabase();
        const ref = refDB(db, `recipes/${userId}`);
        const snapshot = await get(ref);
        const inDBMapping = snapshot.val() as dbResult;
        const results = [] as compareResult[];
        const checked = new Set();

        for (const localRecipe of recipes) {
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

        const promises = results.map(r => {
            if ([ 'ADD_REMOTE', 'UPDATE_REMOTE' ].includes(r.type)) {
                const recipeRef = refDB(db, `recipes/${userId}/${r.recipe.id}`);

                return set(recipeRef, r.recipe);
            }

            return null;
        });

        await Promise.all(promises);

        console.log('RECIPES_SYNC_FINISHED', syncId);

        return results;
    } catch (error) {
        console.log('RECIPES_SYNC_FAILED', syncId);

        console.error(error);

        return [];
    }
}
