import { bijectionCurve } from '~/utils/sorter';

describe('bijectionCurve', function () {
    it('single argument', function () {
        expect(bijectionCurve(1)).to.greaterThan(bijectionCurve(0));
        expect(bijectionCurve(2)).to.greaterThan(bijectionCurve(1));
        expect(bijectionCurve(3)).to.greaterThan(bijectionCurve(2));
        expect(bijectionCurve(4)).to.greaterThan(bijectionCurve(3));
        expect(bijectionCurve(100)).to.greaterThan(bijectionCurve(10));
    });
});
