import { $, component$,  useContext,  useSignal,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$,  useLocation } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import firebaseUI from '~/firebase/ui';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';
import Glogo from '~/media/google-logo.png?jsx';
import { appContext } from '~/stores';
import { qwikErrorDecorator } from '~/errors';
import cookiesManager from '~/cookiesManager';
import FirebaseServer from '~/firebase/server';
import Page from '~/components/Page';
import Header from '~/components/Header/header';

export const useRedirect = routeAction$(async ({ token }, { env, cookie, redirect }) => {
    const firebaseServer = new FirebaseServer({ env });

    const jwttoken = await firebaseServer.getToken(token as string);

    cookiesManager.setSession(cookie, jwttoken);

    throw redirect(302, '/recipes');
});

export default component$(() => {
    const action = useRedirect();
    const location = useLocation();
    const step = useSignal<'create-user'|'verify-email'>('create-user');
    const email = useSignal('');
    const password = useSignal('');
    const fullName = useSignal('');
    const app = useContext(appContext);
    const error = useSignal('');

    const handleSignUpClickInternal = $(async () => {
        await firebaseUI.signUp({
            email    : email.value,
            password : password.value,
            fullName : fullName.value
        }, location.url);

        step.value = 'verify-email';
    });

    const handleSignUpClick = $(() =>
        qwikErrorDecorator(handleSignUpClickInternal, { app, signals: { main: error } }));

    const googleLogin = $(async () => {
        const authorized = await firebaseUI.googleSignIn();

        action.submit(authorized);
    });

    return <Page>
        <Header actions={[]} q:slot='header'></Header>
        <div q:slot='content' class={styles.page}>
            <div class={styles.header}>
                <h1>{$localize `pages.signup.title`}</h1>
                <h2>{$localize `pages.signup.subtitle`}</h2>
                <p class={styles.error}>{error}</p>
            </div>
            <div class={styles.content}>
                {
                    step.value === 'verify-email' && <div>{$localize `pages.signup.verify_email_sent`}</div>
                }
                {
                    step.value === 'create-user' && <>
                        <TextInput type='email' value={email} label={$localize `pages.signup.email_key`} class={styles.input}/>
                        <TextInput type='text' value={fullName} label={$localize `pages.signup.fullName_key`} class={styles.input}/>
                        <TextInput type='password' value={password} label={$localize `pages.signup.password_key`} class={styles.input}/>
                        <Button class={styles.signUpBtn} onClick={handleSignUpClick}>{$localize `pages.signup.SignUp_btn`}</Button>
                        <div class={styles.providers}>
                            <Button icon={true} class={styles.googleBtn} onClick={googleLogin}><Glogo/></Button>
                        </div>
                    </>
                }
            </div>
        </div>
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.signup.head_title`
};

