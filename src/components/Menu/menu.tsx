import { component$, useContext  } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$, useContent, useLocation } from '@builder.io/qwik-city';
import styles from './menu.module.css';
import { appContext } from '~/stores/app';

export default component$(() => {
    const app = useContext(appContext);

    const { menu } = useContent();

    if (!menu?.items) return null;

    return (
        <nav class={[ styles.menu, { [styles.opened]: app.isMenuOpened } ]}>
                {
                ...menu.items.map(m =>
                    <li key={m.href} class={styles.item}>
                        <a class={styles.link} href={m.href}>{m.text}</a>
                    </li>)
                }
        </nav>
    );
});

