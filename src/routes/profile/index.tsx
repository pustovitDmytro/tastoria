import { $, component$,  useContext,  useSignal,  useStore, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$ } from '@builder.io/qwik-city';
import styles from './styles.module.css';
import Button from '~/components/Button';
import Select from '~/components/Select';
import { sessionContext } from '~/stores/session';
import { appContext } from '~/stores/app';
import { languages } from '~/i18n';

export const useSignOut = routeAction$((a, { cookie, redirect }) => {
    cookie.delete('tastoria.session', { path: '/' });
    cookie.delete('tastoria.app', { path: '/' });

    throw redirect(302, '/login');
});

export const useChangeLanguage = routeAction$(async ({ language }, { cookie }) => {
    await cookie.set(
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

    const { email, fullName, lastLoginAt } = session.user.value;
    const info = [
        { label: $localize `pages.profile.email_key`, value: email },
        { label: $localize `pages.profile.fullName_key`, value: fullName },
        { label: $localize `pages.profile.lastLoginAt_key`, value: lastLoginAt }
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
        }
    });

    return (
        <div class={styles.page}>
            <div class={styles.header}>
                <h1>{$localize `pages.profile.title`}</h1>
            </div>
            <div class={styles.content}>
                <h2>{$localize `pages.profile.personal_info_title`}</h2>
                    {
                        ...info.map(i => <div class={styles.infoBox} key={i.label}>
                            <span class={styles.infoLabel}>{i.label}</span>
                            <span class={styles.infoValue}>{i.value}</span>
                        </div>)
                    }
                    <h2>{$localize `pages.profile.settings_title`}</h2>
                    <div class={styles.infoBox}>
                        <span class={styles.infoLabel}>{$localize `pages.profile.language_key`}</span>
                        <Select class={styles.infoValue} value={language} options={languages}/>
                    </div>

            </div>
            <div class={styles.footer}>
                <Button class={styles.button} onClick={handleSignOut}>{$localize `pages.profile.sign_out_btn`}</Button>
            </div>
        </div>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.profile.head_title`
};

