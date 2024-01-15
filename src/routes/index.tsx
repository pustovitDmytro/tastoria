import type { RequestEvent } from '@builder.io/qwik-city';

export const onGet = async ({ cookie, redirect }: RequestEvent) => {
    const firstPage = cookie.get('tastoria.session') ? '/recipes' : '/login';

    throw redirect(302, firstPage);
};
