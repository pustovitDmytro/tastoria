import type { RequestHandler } from '@builder.io/qwik-city';
import cookiesManager from '~/cookiesManager';
import Cipher from '~/utils/aes';
import { createEntityStorage } from '~/entityStorage/server';

// Owner-only access: the session user gets their own images; anyone else must
// present a valid share token that decrypts to the requested owner id.
async function resolveOwnerId({ query, cookie, env }) {
    const session = await cookiesManager.getSession(cookie, env);
    const requestedUserId = query.get('userId') || session?.userId;

    if (!requestedUserId) return null;
    if (session?.userId === requestedUserId) return requestedUserId;

    const shareToken = query.get('share');

    if (!shareToken) return null;

    try {
        const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });
        const [ sharedUserId ] = await cipher.decrypt(shareToken);

        if (sharedUserId === requestedUserId) return requestedUserId;
    } catch {
        return null;
    }

    return null;
}

export const onGet: RequestHandler = async ({ params, query, cookie, env, json, redirect }) => {
    const ownerId = await resolveOwnerId({ query, cookie, env });

    if (!ownerId) {
        json(403, { code: 'IMAGE_ACCESS_DENIED' });

        return;
    }

    const storage = createEntityStorage({ env });
    const signedUrl = await storage.getImageUrl(ownerId, params.name);

    throw redirect(302, signedUrl);
};

export const onPost: RequestHandler = async ({ params, cookie, env, json, request }) => {
    const session = await cookiesManager.getSession(cookie, env);

    if (!session) {
        json(401, { code: 'SESSION_NOT_FOUND' });

        return;
    }

    const data = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') || undefined;
    const storage = createEntityStorage({ env });

    await storage.saveImage(session.userId, params.name, data, contentType);

    json(200, { ok: true });
};
