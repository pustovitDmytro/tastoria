import { $, component$,  useSignal,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$ } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import firebase from '~/firebase';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';
import Glogo from '~/media/google-logo.png?jsx';

export const useRedirect = routeAction$(async (user, { cookie, redirect }) => {
    cookie.set('tastoria.session', user, {
        path     : '/',
        maxAge   : [ 365, 'days' ],
        sameSite : 'strict'
    });

    throw redirect(302, '/recipes');
});


export default component$(() => {
    const action = useRedirect();
    const email = useSignal('');
    const password = useSignal('');

    const handleLoginClick = $(async () => {
        console.log('credentials:', email.value, password.value);
    });

    const googleLogin = $(async () => {
        const authorized = await firebase.signIn();

        console.log(`Signed In as ${authorized.email}`);

        action.submit(authorized);
    });

    return (
        <>
            <div class={styles.page}>
                <div class={styles.header}>
                    <h1>{$localize `pages.login.title`}</h1>
                    <h2>{$localize `pages.login.subtitle`}</h2>
                </div>
                <div class={styles.content}>
                    <TextInput type='email' value={email} label={$localize `pages.login.email_key`} class={styles.input}/>
                    <TextInput type='password' value={password} label={$localize `pages.login.password_key`} class={styles.input}/>
                    <div class={styles.hints}><Button inline={true}>{$localize `pages.login.forgot_password`}</Button></div>
                    <Button class={styles.loginBtn} onClick={handleLoginClick}>{$localize `pages.login.logIn_btn`}</Button>
                    <div class={styles.providers}>
                        <Glogo onClick$={googleLogin}/>
                    </div>
                </div>
                <div class={styles.footer}>{$localize `pages.login.signUp_text`}<Button inline={true}>{$localize `pages.login.signUp_btn`}</Button></div>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.login.head_title`
};

