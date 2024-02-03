/* eslint-disable no-secrets/no-secrets */
import { component$, useContext, Slot } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import styles from './header.module.css';
import Hamburger from '~/components/Icons/hamburger';
import { sessionContext, appContext } from '~/stores';
import Avatar from '~/components/Avatar';
import { toNumber } from '~/utils/common';

type Props = {
    class?: string;
};

const userIdAlphabet = [
    ...'abcdefghijklmnopqrstuvwxyz',
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ...'0123456789'
];
const module = Number.MAX_SAFE_INTEGER;

function getAvatarSeed(userId) {
    const n = toNumber(userId, userIdAlphabet);
    const b = Number(n % BigInt(module));

    return b / module;
}

export default component$((props: Props) => {
    const session = useContext(sessionContext);
    const app = useContext(appContext);

    return (
        <header class={[ styles.container, props.class ]}>
            <div class={styles.menu} onClick$={e => app.isMenuOpened = !app.isMenuOpened}>
                <Hamburger class={styles.hamburger} isOpened={app.isMenuOpened}/>
            </div>
            <Slot/>
            {
                session.user.value
                    ? <Link href='/profile'>
                        {
                            session.user.value.avatar
                                ? <img src={session.user.value.avatar} class={styles.avatar} crossOrigin='anonymous'/>
                                : <Avatar seed={getAvatarSeed(session.user.value.id)} class={styles.avatar}/>
                        }
                    </Link>
                    : null
            }
        </header>
    );
});
