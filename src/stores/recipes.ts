import type { Signal } from '@builder.io/qwik';
import { createContextId } from '@builder.io/qwik';
import type { Recipe, ReceiptFilter } from '~/types';

export interface Recipes {
    all: {
        [key: string]: Recipe;
    },
    tags: Array<ReceiptFilter>,
    categories: Array<ReceiptFilter>,
    lastChanged: Signal<Date>
}

export default createContextId<Recipes>('Recipes');
