import { component$, Slot, useStyles$, useStore, useContextProvider, useVisibleTask$, useSignal } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import fonts from './fonts.css?inline';
import styles from './styles.module.css';
import Footer from '~/components/Footer/footer';
import { sessionContext, appContext, recipesContext } from '~/stores';
import Menu from '~/components/Menu/menu';
import { extractLang, useI18n } from '~/i18n';
import FirebaseServer from '~/firebase/server';
import Toasts from '~/components/Toasts';
import cookiesManager from '~/cookiesManager';

// export const onGet: RequestHandler = async ({ cacheControl, cookie }) => {
//     cacheControl({ // https://qwik.builder.io/docs/caching/
//         staleWhileRevalidate : 60 * 60 * 24 * 7, // Always serve a cached response by default, up to a week stale
//         maxAge               : 5
//         // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
//     });
// };

export const useSession = routeLoader$(async ({ cookie, env }) => {
    const session = await cookiesManager.getSession(cookie, env);

    if (!session) return null;

    const firebaseServer = new FirebaseServer({ env });

    return firebaseServer.signIn(session.token);
});

export const useSettings = routeLoader$(async ({ locale, cookie }) => {
    const app = cookie.get('tastoria.app');

    const language = app ? (app.json() as any).language : 'en';

    locale(extractLang(language));

    return { language };
});

function debounce(func, timeout = 10_000) {
    let timer;

    return (...args) => {
        if (!timer) {
            func.apply(null, args);
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = undefined;
        }, timeout);
    };
}

async function runBackgroundSync(time, mapping, sessionStore) {
    // const serviceWorkerExists = navigator.serviceWorker;

    // console.log('serviceWorkerExists:', !!serviceWorkerExists);

    const res = await fetch('/api/sync/recipes', {
        headers : {
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
        },
        method : 'POST',
        body   : JSON.stringify(Object.values(mapping))
    });

    const { implement, user } = await res.json();

    if (!implement) return;
    // eslint-disable-next-line no-param-reassign
    sessionStore.user.value = user;

    implement.forEach(i => {
        if ([ 'UPDATE_LOCAL', 'ADD_LOCAL' ].includes(i.type)) {
            // eslint-disable-next-line no-param-reassign
            mapping[i.recipe.id] = i.recipe;
        }
    });

    // const registration = await navigator.serviceWorker.ready;

    // console.log('registration:', registration);

    // const register = await registration.sync.register('addTask');

    // console.log('register:', register);
}

const debouncedSync = debounce((a, b, c) => runBackgroundSync(a, b, c));

export const useRecipes = routeLoader$(async ({ env, cookie }) => {
    const session = await cookiesManager.getSession(cookie, env);

    if (!session) return [];

    const firebaseServer = new FirebaseServer({ env });

    await firebaseServer.signIn(session.token);
    const recipes = await firebaseServer.downloadRecipes(session.userId);

    return recipes.filter(f => !f.deletedAt);
});


export default component$(() => {
    useI18n();
    useStyles$(fonts);

    const session = useSession();
    const settings = useSettings();
    const recipes = useRecipes();

    const map = {};

    recipes.value.forEach(r => map[r.id] =  r);

    const sessionStore = useStore({ user: session });
    const appStore = useStore({ isMenuOpened: false, language: settings.value.language, toasts: {} });
    const recipesStore = useStore({ all: map, lastChanged: useSignal(new Date()) });

    useContextProvider(sessionContext, sessionStore);
    useContextProvider(appContext, appStore);
    useContextProvider(recipesContext, recipesStore);

    useVisibleTask$(({ track }) => {
        const changeTime = track(() => recipesStore.lastChanged.value);

        // debouncedSync(changeTime, recipesStore.all, sessionStore);
    });

    return (
        <>
            <div class={styles.page}>
                <Menu/>
                <div class={styles.content}>
                    <Slot/>
                </div>
                <Footer class={styles.footer}/>
                <Toasts/>
            </div>
        </>
    );
});
