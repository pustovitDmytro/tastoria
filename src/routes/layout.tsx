import { component$, Slot, useStyles$, useStore, useContextProvider } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { RequestHandler } from '@builder.io/qwik-city';
import styles from './fonts.css?inline';
import Header from '~/components/Header/header';
import Footer from '~/components/Footer/footer';
import type { SessionStore } from '~/stores/session';
import { sessionContext } from '~/stores/session';

export const onGet: RequestHandler = async ({ cacheControl, cookie }) => {
    // cacheControl({ // https://qwik.builder.io/docs/caching/
    //     staleWhileRevalidate : 60 * 60 * 24 * 7, // Always serve a cached response by default, up to a week stale
    //     maxAge               : 5
    //     // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    // });
};

export const useSession = routeLoader$(async ({ cookie }) => {
    const session = cookie.get('tastoria.session');

    return session?.json();
});

export const useServerTimeLoader = routeLoader$(() => {
    return {
        date : new Date().toISOString()
    };
});

export default component$(() => {
    useStyles$(styles);
    const session = useSession();
    const store = useStore({ user: session });

    useContextProvider(
        sessionContext,
        store
    );

    return (
        <>
            <main>
                <Header />
                <Slot />
                <Footer />
            </main>
        </>
    );
});
