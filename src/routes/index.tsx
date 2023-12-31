import { component$, useVisibleTask$  } from '@builder.io/qwik';
import type { DocumentHead, RequestEvent } from '@builder.io/qwik-city';

export const onGet = async ({ cookie, redirect }: RequestEvent) => {
    throw cookie.get('tastoria.session') ? redirect(302, '/recipes') : redirect(302, '/login');
};
