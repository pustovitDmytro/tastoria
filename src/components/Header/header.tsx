import { component$, useContext } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import styles from './header.module.css';
import Hamburger from '~/components/Icons/hamburger';

import { sessionContext } from '~/stores/session';
import { appContext } from '~/stores/app';

type Props = {
    class?: string;
};

export default component$((props: Props) => {
    const session = useContext(sessionContext);
    const app = useContext(appContext);

    return (
        <header class={[ styles.container, props.class ]}>
            <div class={styles.menu} onClick$={e => app.isMenuOpened = !app.isMenuOpened}>
                <Hamburger class={styles.hamburger} isOpened={app.isMenuOpened}/>
            </div>
            {
                session.user.value
                    ? <Link href='/profile'>
                        <img src={session.user.value.avatar} class={styles.avatar} crossOrigin='anonymous'/>
                    </Link>
                    : null
            }
        </header>
    );
});
