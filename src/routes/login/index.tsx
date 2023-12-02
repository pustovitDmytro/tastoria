import { $, component$,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$ } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import firebase from '~/firebase';
import TextInput from '~/components/TextInput';
import Button from '~/components/Button';
import Glogo from '~/media/google-logo.png?jsx';

export const useRedirect = routeAction$(async (user, { cookie, redirect }) => {
    cookie.set('tastoria.session', user, { path: '/', maxAge: [ 365, 'days' ] });

    throw redirect(302, '/recipes');
});


export default component$(() => {
    const action = useRedirect();
    const credentials = useStore({
        email    : '',
        password : ''
    });

    const handleLoginClick = $(async () => {
        console.log('credentials:', credentials);
    });

    const googleLogin = $(async () => {
        const authorized = await firebase.signIn();

        action.submit(authorized);
    });

    return (
        <>
            <div class={styles.page}>
                <div class={styles.header}>
                    <h1>Log in</h1>
                    <h2>Please login to using app</h2>
                </div>
                <div class={styles.content}>
                    <TextInput type='email' value={credentials.email} label='Email' class={styles.input}/>
                    <TextInput type='password' value={credentials.password} label='Password' class={styles.input}/>
                    <div class={styles.hints}><Button inline={true}>forgot password?</Button></div>
                    <Button class={styles.loginBtn} onClick={handleLoginClick}>Log In</Button>
                    <div class={styles.providers}>
                        <Glogo onClick$={googleLogin}/>
                    </div>
                </div>
                <div class={styles.footer}>Dont have an account? <Button inline={true}>Sign Up</Button></div>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : 'Tastoria',
    meta  : [
        {
            name    : 'description',
            content : 'Main page'
        }
    ]
};

