import { syncUserRecipes } from '~/utils/sync';

export const onPost = async ({ json, cookie, parseBody }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return json(401, { code: 'SESSION_NOT_FOUND' });
    const localRecipes = await parseBody();

    const res = await syncUserRecipes(user.id, localRecipes);

    const localImplement = res.filter(r => [ 'UPDATE_LOCAL', 'ADD_LOCAL' ].includes(r.type));

    json(200, { implement: localImplement });
};
