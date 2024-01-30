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

const VerifyEmailStep = component$(() => {
    const email = useSignal('');
    const isSend = useSignal(false);
    const location = useLocation();

    const handleSignUpClick = $(async () => {
        await firebase.verifyEmail(email.value, location.url);

        isSend.value = true;
    });

    return (
        <>
            <TextInput type='email' value={email} label={$localize `pages.signup.email_key`} class={styles.input}/>
            <Button class={styles.signUpBtn} onClick={handleSignUpClick}>{$localize `pages.signup.SignUp_btn`}</Button>
            {
                isSend.value && <div>{$localize `pages.signup.SignUp_btn`}</div>
            }
        </>
    );
});

const CreateUserStep = component$(() => {
    const email = useSignal('');
    const password = useSignal('');
    const fullName = useSignal('');
    const location = useLocation();
    const action = useRedirect();

    const handleSignUpClick = $(async () => {
        const authorized = await firebase.signUp({
            email    : email.value,
            password : password.value,
            fullName : fullName.value
        }, location.url);

        action.submit(authorized);
        // FirebaseError: Firebase: Error (auth/email-already-in-use).
    });

    return (
        <>
            <TextInput type='email' value={email} label={$localize `pages.signup.email_key`} class={styles.input}/>
            <TextInput type='text' value={fullName} label={$localize `pages.signup.fullName_key`} class={styles.input}/>
            <TextInput type='password' value={password} label={$localize `pages.signup.password_key`} class={styles.input}/>
            <Button class={styles.signUpBtn} onClick={handleSignUpClick}>{$localize `pages.signup.SignUp_btn`}</Button>
        </>
    );
});

export default component$(() => {
    const action = useRedirect();
    const location = useLocation();
    const step = location.url.searchParams.get('step') || 'verify-email';

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
                        step === 'verify-email' && <VerifyEmailStep/>
                    }
                    {
                        step === 'create-user' && <CreateUserStep/>
                    }
                    <div class={styles.providers}>
                        <Button icon={true} class={styles.googleBtn} onClick={googleLogin}><Glogo/></Button>
                    </div>
                </div>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.signup.head_title`
};

