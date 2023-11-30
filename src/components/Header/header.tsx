import { component$, useContext } from '@builder.io/qwik';
import styles from './header.module.css';

import { sessionContext } from '~/stores/session';
import { appContext } from '~/stores/app';

export default component$(() => {
    const session = useContext(sessionContext);
    const app = useContext(appContext);

    return (
        <header class={styles.header}>
            <div class={styles.menu} onClick$={e => app.isMenuOpened = !app.isMenuOpened}>☰</div>
            {
                session.user.value
                    ? <img src={session.user.value.avatar} class={styles.avatar} crossOrigin='anonymous'/>
                    : null
            }
        </header>
    );
});
