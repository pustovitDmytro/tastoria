import cookiesManager from '~/cookiesManager';
import FirebaseServer from '~/firebase/server';

export const onPost = async ({ json, env, cookie, parseBody }) => {
    const session = await cookiesManager.getSession(cookie, env);

    if (!session) return json(401, { code: 'SESSION_NOT_FOUND' });
    const localRecipes = await parseBody();
    const firebaseServer = new FirebaseServer({ env });

    const user = await firebaseServer.signIn(session.token);

    const res = await firebaseServer.syncUserRecipes(session.userId, localRecipes);

    const localImplement = res.filter(r => [ 'UPDATE_LOCAL', 'ADD_LOCAL' ].includes(r.type));

    json(200, { implement: localImplement, user });
};
