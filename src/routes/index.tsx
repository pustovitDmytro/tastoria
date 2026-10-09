import type { RequestEvent } from '@builder.io/qwik-city';
import cookiesManager from '~/cookiesManager';

export const onGet = async ({ cookie, env, redirect }: RequestEvent) => {
    const firstPage = await cookiesManager.isLoggedIn(cookie, env)
        ? '/recipes'
        : '/login';

    throw redirect(302, firstPage);
};
