import type { Signal } from '@builder.io/qwik';
import { createContextId } from '@builder.io/qwik';
import type { Recipe } from '~/types';

export interface Recipes {
    all: {
        [key: string]: Recipe;
    },
    lastChanged: Signal<Date>
}

export default createContextId<Recipes>('Recipes');
