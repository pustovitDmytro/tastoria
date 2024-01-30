import type { User } from 'firebase/auth';
import type { Recipe } from '~/types';

export function dumpRecipe(r: any): Recipe {
    return {
        id         : r.id,
        title      : r.title,
        image      : r.image || null,
        categories : r.categories || [],
        tags       : r.tags || [],

        description : r.description || null,
        ingredients : r.ingredients || [],
        steps       : r.steps || [],
        url         : r.url || null,
        time        : r.time || {},
        quantity    : r.quantity || null,
        comment     : r.comment || null,
        language    : r.language || null,
        version     : r.version,

        favorite : r.favorite || false,
        visits   : r.visits || 0,
        rating   : r.rating || null,

        createdAt : r.createdAt,
        updatedAt : r.updatedAt,
        deletedAt : r.deletedAt
    };
}

export function dumpUserSessionData(user: User) {
    const meta = user.metadata;

    return {
        id       : user.uid,
        email    : user.email,
        fullName : user.displayName,
        avatar   : user.photoURL,

        lastLoginAt : meta.lastSignInTime,
        createdAt   : meta.creationTime

        // accessToken: user.accessToken
    };
}
