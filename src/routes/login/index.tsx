import { $, component$,  useContext,  useSignal,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link, routeAction$, useLocation } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import firebase from '~/firebase';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';
import Glogo from '~/media/google-logo.png?jsx';
import { appContext } from '~/stores';
import { qwikErrorDecorator } from '~/errors';

export const useRedirect = routeAction$(async (user, { cookie, redirect }) => {
    cookie.set('tastoria.session', user, {
        path     : '/',
        maxAge   : [ 365, 'days' ],
        sameSite : 'strict'
    });

    throw redirect(302, '/recipes');
});

export default component$(() => {
    const location = useLocation();
    const action = useRedirect();
    const prefilledEmail = location.url.searchParams.get('email');
    const email = useSignal(prefilledEmail || '');
    const password = useSignal('');
    const app = useContext(appContext);
    const error = useSignal('');

    const handleLoginClick = $(() =>
        qwikErrorDecorator($(async () => {
            const authorized = await firebase.signIn({
                email    : email.value,
                password : password.value
            });

            action.submit(authorized);
        }), { app, signals: { main: error } }));


    const googleLogin = $(async () => {
        qwikErrorDecorator(
            $(async () => {
                const authorized = await firebase.googleSignIn();

                action.submit(authorized);
            }),
            { app, signals: { main: error } }
        );
    });

    return (
        <>
            <div class={styles.page}>
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
        </>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.login.head_title`
};

