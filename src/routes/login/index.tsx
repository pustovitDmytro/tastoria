import { $, component$,  useContext,  useSignal,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeAction$, useLocation } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';
import Glogo from '~/media/google-logo.png?jsx';
import { appContext, sessionContext, recipesContext } from '~/stores';
import { qwikErrorDecorator } from '~/errors';
import firebaseUI from '~/firebase/ui';
import FirebaseServer from '~/firebase/server';
import cookiesManager from '~/cookiesManager';
import Page from '~/components/Page';
import Header from '~/components/Header/header';

export const useSignIn = routeAction$(async ({ token }, { env, cookie, redirect }) => {
    const firebaseServer = new FirebaseServer({ env });
    const jwttoken = await firebaseServer.getToken(token as string);

    cookiesManager.setSession(cookie, jwttoken);

    throw redirect(302, '/recipes');
});

export default component$(() => {
    const location = useLocation();
    const action = useSignIn();
    const prefilledEmail = location.url.searchParams.get('email');
    const email = useSignal(prefilledEmail || '');
    const password = useSignal('');
    const app = useContext(appContext);
    const session = useContext(sessionContext);
    const error = useSignal('');
    const recipeContext = useContext(recipesContext);

    const handleLoginClick = $(() =>
        qwikErrorDecorator($(async () => {
            const authorized = await firebaseUI.signIn({
                email    : email.value,
                password : password.value
            });

            session.user = authorized.user;
            await action.submit(authorized);
            recipeContext.lastChanged.value = new Date();
        }), { app, signals: { main: error } }));


    const googleLogin = $(async () => {
        qwikErrorDecorator(
            $(async () => {
                const authorized = await firebaseUI.googleSignIn();

                session.user = authorized.user;

                await action.submit(authorized);
                recipeContext.lastChanged.value = new Date();
            }),
            { app, signals: { main: error } }
        );
    });

    return <Page>
        <Header actions={[]} q:slot='header'></Header>
        <div q:slot='content' class={styles.page}>
            <div class={styles.header}>
                <h1>{$localize `pages.login.title`}</h1>
                <h2>{$localize `pages.login.subtitle`}</h2>
                <p class={styles.error}>{error}</p>
            </div>
            <div class={styles.content}>
                <TextInput type='email' value={email} label={$localize `pages.login.email_key`} class={styles.input}/>
                <TextInput type='password' value={password} label={$localize `pages.login.password_key`} class={styles.input}/>
                <div class={styles.hints}>
                    <Link class={styles.signUpLink} prefetch href={'/forgot_password'}>
                        {$localize `pages.login.forgot_password`}
                    </Link>
                </div>
                <Button class={styles.loginBtn} onClick={handleLoginClick}>{$localize `pages.login.logIn_btn`}</Button>
                <div class={styles.providers}>
                    <Glogo onClick$={googleLogin}/>
                </div>
            </div>
            <div class={styles.footer}>{$localize `pages.login.signUp_text`}
                <Link class={styles.signUpLink} prefetch href={'/signup'}>{$localize `pages.login.signUp_btn`}</Link>
            </div>
        </div>
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.login.head_title`
};

