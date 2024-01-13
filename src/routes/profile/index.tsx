import { $, component$,  useContext,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$ } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import Button from '~/components/Button';
import { sessionContext } from '~/stores/session';

export const useRedirect = routeAction$(async (a, { cookie, redirect }) => {
    cookie.delete('tastoria.session', { path: '/' });

    throw redirect(302, '/login');
});

export default component$(() => {
    const session = useContext(sessionContext);
    const { email, fullName, lastLoginAt } = session.user.value;
    const info = [
        { label: 'Email address', value: email },
        { label: 'Full Name', value: fullName },
        { label: 'Last Login', value: lastLoginAt }
    ];

    const action = useRedirect();

    const handleSignOut = $(async () => {
        action.submit();
    });

    return (
        <div class={styles.page}>
            <div class={styles.header}>
                <h1>Profile</h1>
            </div>
            <div class={styles.content}>
                <h2>Personal Information</h2>
                    {
                        ...info.map(i => <div class={styles.infoBox} key={i.label}>
                            <span class={styles.infoLabel}>{i.label}</span>
                            <span class={styles.infoValue}>{i.value}</span>
                        </div>)
                    }
            </div>
            <div class={styles.footer}>
                <Button class={styles.button} onClick={handleSignOut}>Sign out</Button>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title : 'Profile'
};

