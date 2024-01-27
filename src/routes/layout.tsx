import { component$, Slot, useStyles$, useStore, useContextProvider, useVisibleTask$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import fonts from './fonts.css?inline';
import styles from './styles.module.css';
import Header from '~/components/Header/header';
import Footer from '~/components/Footer/footer';
import { sessionContext, appContext, slotContext, recipesContext } from '~/stores';
import type { SlotState } from '~/stores/slot';
import Menu from '~/components/Menu/menu';
import { extractLang, useI18n } from '~/i18n';
import firebase from '~/firebase';
// export const onGet: RequestHandler = async ({ cacheControl, cookie }) => {
//     cacheControl({ // https://qwik.builder.io/docs/caching/
//         staleWhileRevalidate : 60 * 60 * 24 * 7, // Always serve a cached response by default, up to a week stale
//         maxAge               : 5
//         // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
//     });
// };

export const useSession = routeLoader$(async ({ cookie }) => {
    const session = cookie.get('tastoria.session');

    return session?.json();
});

export const useSettings = routeLoader$(async ({ locale, cookie }) => {
    const app = cookie.get('tastoria.app');

    const language = app ? (app.json() as any).language : 'en';

    locale(extractLang(language));

    return { language };
});

async function runBackgroundSync(list) {
    const serviceWorkerExists = navigator.serviceWorker;

    console.log('serviceWorkerExists:', !!serviceWorkerExists);

    const res = await fetch('/api/sync/recipes', {
        headers : {
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
        },
        method : 'POST',
        body   : JSON.stringify(list)
    });

    const { implement } = await res.json();

    console.log('implement:', implement);

    // const registration = await navigator.serviceWorker.ready;

    // console.log('registration:', registration);

    // const register = await registration.sync.register('addTask');

    // console.log('register:', register);
}

export const useRecipes = routeLoader$(async ({ cookie }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return [];

    return firebase.downloadRecipes(user.id);
});


export default component$(() => {
    useI18n();
    useStyles$(fonts);

    const session = useSession();
    const settings = useSettings();
    const recipes = useRecipes();

    const slotCtx = useStore<SlotState>({
        header      : null,
        contextMenu : null
    });

    const sessionStore = useStore({ user: session });
    const appStore = useStore({ isMenuOpened: false, language: settings.value.language });
    const recipesStore = useStore({ list: recipes });

    useContextProvider(sessionContext, sessionStore);
    useContextProvider(appContext, appStore);
    useContextProvider(slotContext, slotCtx);
    useContextProvider(recipesContext, recipesStore);

    const HeaderContent = () => slotCtx.header;

    useVisibleTask$(({ track }) => {
        const c = track(() => recipesStore.list.value);

        runBackgroundSync(recipesStore.list.value);
    });

    return (
        <>
            <main class={styles.page}>
                <Header class={styles.header}>
                    <div class={styles.headerContent}>
                        <HeaderContent/>
                    </div>
                </Header>
                <Menu/>
                <div class={styles.content}>
                    <Slot/>
                </div>
                <Footer class={styles.footer}/>
            </main>
        </>
    );
});
