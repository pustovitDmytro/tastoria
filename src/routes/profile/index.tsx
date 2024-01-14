import { $, component$,  useContext,  useSignal,  useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, useNavigate } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import Button from '~/components/Button';
import Select from '~/components/Select';
import { sessionContext } from '~/stores/session';
import { appContext } from '~/stores/app';

export const useSignOut = routeAction$((a, { cookie, redirect }) => {
    cookie.delete('tastoria.session', { path: '/' });
    cookie.delete('tastoria.app', { path: '/' });

    throw redirect(302, '/login');
});

export const useChangeLanguage = routeAction$(({ language }, { cookie }) => {
    cookie.set(
        'tastoria.app',
        { language },
        {
            path     : '/',
            sameSite : 'strict'
        }
    );
});

export default component$(() => {
    const session = useContext(sessionContext);
    const app = useContext(appContext);
    const nav = useNavigate();

    const { email, fullName, lastLoginAt } = session.user.value;
    const info = [
        { label: 'Email address', value: email },
        { label: 'Full Name', value: fullName },
        { label: 'Last Login', value: lastLoginAt }
    ];

    const languages = [
        { id: 'en', label: 'English' },
        { id: 'ua', label: 'Українська' }
    ];

    const language = useSignal(app.language);

    const signOutAction = useSignOut();
    const changeLanguageAction = useChangeLanguage();

    const handleSignOut = $(async () => {
        signOutAction.submit();
    });

    useVisibleTask$(async ({ track }) => {
        track(() => language.value);
        if (language.value !== app.language) {
            await changeLanguageAction.submit({ language: language.value });
            nav();
        }
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
                    <h2>{$localize `pages.profile.content.settings_title`}</h2>
                    <div class={styles.infoBox}>
                        <span class={styles.infoLabel}>Language</span>
                        <Select class={styles.infoValue} value={language} options={languages}/>
                    </div>

            </div>
            <div class={styles.footer}>
                <Button class={styles.button} onClick={handleSignOut}>Sign out</Button>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.profile.head.title`
};

