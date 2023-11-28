import { component$, useVisibleTask$, useContext, useTask$, useSignal } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, routeAction$ } from '@builder.io/qwik-city';
import firebase from '~/firebase';
import { sessionContext } from '~/stores/session';

export const useRedirect = routeAction$(async (user, { cookie, redirect }) => {
    cookie.set('tastoria.session', user, { path: '/', maxAge: [ 365, 'days' ] });

    throw redirect(302, '/recipes');
});


export default component$(() => {
    const action = useRedirect();
    const session = useContext(sessionContext);

    useVisibleTask$(async () => {
        const authorized = await firebase.signIn();

        action.submit(authorized);
    });

    return (
        <>
            Login page
            User: {JSON.stringify(session.user.value?.email)}
        </>
    );
});

export const head: DocumentHead = {
    title : 'Tastoria',
    meta  : [
        {
            name    : 'description',
            content : 'Main page'
        }
    ]
};

