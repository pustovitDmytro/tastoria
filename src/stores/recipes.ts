import type { Signal } from '@builder.io/qwik';
import { createContextId } from '@builder.io/qwik';
import type { Receipt } from '~/types';

export interface Recipes {
    list: Signal<Receipt[]>;
}

export default createContextId<Recipes>('Recipes');
