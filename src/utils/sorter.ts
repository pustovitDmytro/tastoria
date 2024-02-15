import { uuidToNumber } from './common';
import type { Recipe } from '~/types';

export function ranger(x:number, A:number, B:number) {
    return ((B - A) * x) / (x + 1) + A;
}

const SAFE_FOR_RANGER = 1_000_000_000;

export function bijectionCurve(...dimentions) {
    let accum = 0;
    let min: number;
    let max = SAFE_FOR_RANGER;

    for (const dim of dimentions) {
        min = accum;
        accum = ranger(dim, min, max);

        max = ranger(dim + 1, min, max);
    }

    return accum;
}

export function recipyFavoriteSorter(recipy: Recipe):number {
    return bijectionCurve(
        recipy.favorite ? 1 : 0,
        recipy.visits,
        uuidToNumber(recipy.id) % SAFE_FOR_RANGER
    );
}
