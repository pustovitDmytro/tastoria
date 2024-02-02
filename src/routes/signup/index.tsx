import { $, component$,  useSignal,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$,  useLocation } from '@builder.io/qwik-city';
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
    const location = useLocation();
    const step = useSignal<'create-user'|'verify-email'>('create-user');
    const email = useSignal('');
    const password = useSignal('');
    const fullName = useSignal('');

    const handleSignUpClick = $(async () => {
        await firebase.signUp({
            email    : email.value,
            password : password.value,
            fullName : fullName.value
        }, location.url);

        step.value = 'verify-email';
        // FirebaseError: Firebase: Error (auth/email-already-in-use).
    });

    const googleLogin = $(async () => {
        const authorized = await firebase.googleSignIn();

        console.log(`Signed In as ${authorized.email}`);

        action.submit(authorized);
    });


    return (
        <>
            <div class={styles.page}>
                <div class={styles.header}>
                    <h1>{$localize `pages.signup.title`}</h1>
                    <h2>{$localize `pages.signup.subtitle`}</h2>
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
        </>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.signup.head_title`
};

