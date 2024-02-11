import { v4 as uuid } from 'uuid';
import type { Recipe } from '~/types';

const version = TASTORIA_BUILD.VERSION;

export function getRecipePlaceHolder():Recipe {
    return {
        id          : uuid(),
        title       : '',
        description : '',
        categories  : [],
        tags        : [],
        language    : 'en',
        quantity    : '',
        comment     : '',
        ingredients : [],
        steps       : [],
        time        : {
            total   : '',
            prepare : '',
            cook    : ''
        },
        version,
        favorite : false,
        visits   : 0,
        rating   : 0,

        updatedAt : (new Date()).toISOString(),
        createdAt : (new Date()).toISOString()
    };
}
