import { recipyFavoriteSorter } from '~/utils/sorter';
import { getRecipePlaceHolder } from '~/utils/recipe';
import type { Recipe } from '~/types';

function R(favorite:boolean, visits:number):Recipe {
    return {
        ...getRecipePlaceHolder(),
        favorite,
        visits
    };
}

const sorter = (favorite:boolean, visits:number) => recipyFavoriteSorter(R(favorite, visits));

describe('recipyFavoriteSorter', function () {
    it('favorite domination', function () {
        expect(sorter(true, 0)).to.greaterThan(sorter(false, 0));
        expect(sorter(true, 0)).to.greaterThan(sorter(false, 1));
        expect(sorter(true, 0)).to.greaterThan(sorter(false, 10));
        expect(sorter(true, 0)).to.greaterThan(sorter(false, 100));
        expect(sorter(true, 0)).to.greaterThan(sorter(false, 1000));
        expect(sorter(true, 0)).to.greaterThan(sorter(false, 10_000));
    });

    it('visits domination', function () {
        expect(sorter(true, 10)).to.greaterThan(sorter(true, 9));
        expect(sorter(true, 100)).to.greaterThan(sorter(true, 50));
        expect(sorter(false, 1000)).to.greaterThan(sorter(false, 500));
    });

    it('id consistency', function () {
        expect(sorter(true, 10)).to.not.equal(sorter(true, 10));
        expect(sorter(false, 100)).to.not.equal(sorter(false, 100));
        expect(sorter(true, 1_000_000)).to.not.equal(sorter(false, 1_000_000));
    });
});
