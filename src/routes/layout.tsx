import { component$, Slot, useStyles$, useStore, useContextProvider } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { RequestHandler } from '@builder.io/qwik-city';
import fonts from './fonts.css?inline';
import styles from './styles.module.css';
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
    useStyles$(fonts);
    const session = useSession();
    const store = useStore({ user: session });

    useContextProvider(
        sessionContext,
        store
    );

    return (
        <>
            <main class={styles.page}>
                <Header />
                <div class={styles.content}>
                    <Slot/>
                </div>
                <Footer />
            </main>
        </>
    );
});
