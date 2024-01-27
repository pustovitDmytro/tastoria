import { getDatabase, ref as refDB, set, get } from 'firebase/database';
import { isEqual, isAfter } from 'date-fns';

// import config from '../config';s

import type { Receipt } from '~/types';

interface compareResult {
    type: 'KEEP' | 'UPDATE_REMOTE' | 'UPDATE_LOCAL' | 'CANT_COMPARE' |'ADD_REMOTE'|'ADD_LOCAL',
    recipy: Receipt
}

interface dbResult {
    [key: string]: Receipt;
}

function compareRecipes(remoteRecipy:Receipt, localRecipy:Receipt):compareResult {
    const localDate = localRecipy.updatedAt;
    const remoteDate = remoteRecipy.updatedAt;

    if (isEqual(localDate, remoteDate)) {
        return { type: 'KEEP', recipy: localRecipy };
    }

    if (isAfter(localDate, remoteDate)) {
        return { type: 'UPDATE_REMOTE', recipy: localRecipy };
    }

    if (isAfter(remoteDate, localDate)) {
        return { type: 'UPDATE_LOCAL', recipy: remoteRecipy };
    }

    return { type: 'CANT_COMPARE', recipy: localRecipy };
}


export async function syncUserRecipes(userId:string, recipes:Receipt[]):Promise<compareResult[]>  {
    const syncId = `${userId }_${Date.now()}`;

    try {
        console.log('RECIPES_SYNC_STARTED', syncId);

        const db = getDatabase();
        const ref = refDB(db, `recipes/${userId}`);
        const snapshot = await get(ref);
        const inDBMapping = snapshot.val() as dbResult;
        const results = [] as compareResult[];
        const checked = new Set();

        for (const localRecipy of recipes) {
            const remoteRecipy = inDBMapping[localRecipy.id];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (remoteRecipy) {
                results.push(compareRecipes(remoteRecipy, localRecipy));
            } else {
                results.push({ type: 'ADD_REMOTE', recipy: localRecipy });
            }

            checked.add(localRecipy.id);
        }

        for (const remoteRecipy of Object.values(inDBMapping)) {
            if (!checked.has(remoteRecipy.id)) results.push({ type: 'ADD_LOCAL', recipy: remoteRecipy });
        }

        const promises = results.map(r => {
            if ([ 'ADD_REMOTE', 'UPDATE_REMOTE' ].includes(r.type)) {
                const recipyRef = refDB(db, `recipes/${userId}/${r.recipy.id}`);

                return set(recipyRef, r.recipy);
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
