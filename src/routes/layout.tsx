import { component$, Slot, useStyles$, useStore, useContextProvider, useVisibleTask$, useSignal } from '@builder.io/qwik';
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
import Toasts from '~/components/Toasts';

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

function debounce(func, timeout = 1000) {
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

async function runBackgroundSync(time, mapping) {
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

    const { implement } = await res.json();

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

const debouncedSync = debounce((a, b) => runBackgroundSync(a, b));

export const useRecipes = routeLoader$(async ({ cookie }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return [];

    const recipes = await firebase.downloadRecipes(user.id);

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

    const slotCtx = useStore<SlotState>({
        header      : null,
        contextMenu : null
    });

    const sessionStore = useStore({ user: session });
    const appStore = useStore({ isMenuOpened: false, language: settings.value.language, toasts: {} });
    const recipesStore = useStore({ all: map, lastChanged: useSignal(new Date()) });

    useContextProvider(sessionContext, sessionStore);
    useContextProvider(appContext, appStore);
    useContextProvider(slotContext, slotCtx);
    useContextProvider(recipesContext, recipesStore);

    const HeaderContent = () => slotCtx.header;

    useVisibleTask$(({ track }) => {
        const changeTime = track(() => recipesStore.lastChanged.value);

        debouncedSync(changeTime, recipesStore.all);
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
                <Toasts/>
            </main>
        </>
    );
});
