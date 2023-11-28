import { component$, useContext } from '@builder.io/qwik';
import styles from './header.module.css';

import { sessionContext } from '~/stores/session';

export default component$(() => {
    const session = useContext(sessionContext);

    return (
        <header class={styles.header}>
            {
                session.user.value
                    ? <img src={session.user.value.avatar} class={styles.avatar} crossOrigin='anonymous'/>
                    : null
            }
        </header>
    );
});
