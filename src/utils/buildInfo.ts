export const PROD_HOST = 'tastoria.netlify.app';

export type BuildEnv = 'prod' | 'qa';

export interface BuildSource {
    VERSION: string;
    DATE: string;
    NUMBER: string;
    COMMIT: string;
}

export interface BuildFields {
    version: string | null;
    build: string;
    env: BuildEnv;
    commit: string | null;
    date: string | null;
    label: string;
}

// One bundle is deployed to stagings and then promoted to production, so env comes from the host.
export function buildEnv(host: string): BuildEnv {
    return host === PROD_HOST ? 'prod' : 'qa';
}

export function buildWithEnv(build: string, env: BuildEnv) {
    return env === 'qa' ? `${build} qa` : build;
}

export function formatBuildLabel({ version, build, env, commit }: Omit<BuildFields, 'label' | 'date'>) {
    const buildPart = build === 'dev' ? buildWithEnv(build, env) : `#${buildWithEnv(build, env)}`;

    return [ version, buildPart, commit ].filter(Boolean).join(' · ');
}

export function makeBuildFields(source: BuildSource, host: string): BuildFields {
    const build = source.NUMBER || 'dev';
    const fields = {
        version : source.VERSION || null,
        build,
        env     : buildEnv(host),
        commit  : source.COMMIT || null,
        date    : build === 'dev' ? null : source.DATE.replace(/\.\d+Z$/, 'Z')
    };

    return { ...fields, label: formatBuildLabel(fields) };
}

export function buildFields(host: string): BuildFields {
    return makeBuildFields(TASTORIA_BUILD, host);
}

export function formatBuildCopyText(fields: BuildFields) {
    return [
        fields.version && `Version: ${fields.version}`,
        `Build: ${buildWithEnv(fields.build, fields.env)}`,
        fields.commit && `Commit: ${fields.commit}`,
        fields.date && `Built: ${fields.date}`,
        `Label: ${fields.label}`
    ].filter(Boolean).join('\n');
}
