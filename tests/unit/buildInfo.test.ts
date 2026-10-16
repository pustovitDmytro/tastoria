import { buildEnv, formatBuildCopyText, makeBuildFields } from '~/utils/buildInfo';

const source = { VERSION: '1.32.3', DATE: '2026-10-15T12:34:56.789Z', NUMBER: 'ci-812', COMMIT: '7aeb15f' };

describe('buildInfo', function () {
    it('production host is prod, everything else is qa', function () {
        expect(buildEnv('tastoria.netlify.app')).to.equal('prod');
        expect(buildEnv('staging--tastoria.netlify.app')).to.equal('qa');
        expect(buildEnv('localhost:5173')).to.equal('qa');
    });

    it('ci build on production', function () {
        const fields = makeBuildFields(source, 'tastoria.netlify.app');

        expect(fields.label).to.equal('1.32.3 · #ci-812 · 7aeb15f');
        expect(fields.date).to.equal('2026-10-15T12:34:56Z');
    });

    it('local build on a task staging', function () {
        const fields = makeBuildFields({ ...source, NUMBER: 'ma-14', COMMIT: '3c9d0e1+dirty' }, 'x--tastoria.netlify.app');

        expect(fields.label).to.equal('1.32.3 · #ma-14 qa · 3c9d0e1+dirty');
        expect(formatBuildCopyText(fields)).to.equal([
            'Version: 1.32.3',
            'Build: ma-14 qa',
            'Commit: 3c9d0e1+dirty',
            'Built: 2026-10-15T12:34:56Z',
            'Label: 1.32.3 · #ma-14 qa · 3c9d0e1+dirty'
        ].join('\n'));
    });

    it('dev run has no number and no date', function () {
        const fields = makeBuildFields({ ...source, NUMBER: '', COMMIT: '' }, 'localhost:5173');

        expect(fields.build).to.equal('dev');
        expect(fields.date).to.equal(null);
        expect(fields.label).to.equal('1.32.3 · dev qa');
    });
});
