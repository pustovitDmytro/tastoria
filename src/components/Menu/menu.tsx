import { component$, useContext  } from '@builder.io/qwik';
import styles from './menu.module.css';
import { appContext } from '~/stores';


export default component$(() => {
    const menu = [
        { label: $localize `menu.Recipes`, href: '/recipes/' },
        { label: $localize `menu.Import`, href: '/import/' },
        { label: $localize `menu.About`, href: '/about/' }
    ];
    const app = useContext(appContext);

    return (
        <nav class={[ styles.menu, { [styles.opened]: app.isMenuOpened } ]}>
                {
                ...menu.map(m =>
                    <li key={m.href} class={styles.item}>
                        <a class={styles.link} href={m.href}>{m.label}</a>
                    </li>)
                }
        </nav>
    );
});

