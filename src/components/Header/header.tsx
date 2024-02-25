/* eslint-disable no-secrets/no-secrets */
import { $, component$, useContext, Slot, useSignal, useVisibleTask$, noSerialize } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import styles from './header.module.css';
import type { HeaderAction } from './types';
import Button from '~/components/Button';
import Hamburger from '~/components/Icons/hamburger';
import { sessionContext, appContext } from '~/stores';
import Avatar from '~/components/Avatar';
import { toNumber } from '~/utils/common';
import SignInIcon from '~/components/Icons/signIn.svg';
import ContextMenu from '~/components/Icons/contextMenu.svg';
import Icon from '~/components/Icons/Icon';
import { HEADER_BUTTON_WIDTH, DEFAULT_HEADER_BUTTONS_COUNT } from '~/constants';
import logger from '~/logger';

type Props = {
    class?: string;
    actions: HeaderAction[]
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

function onClickOutside(element, handler) {
    const outsideClickListener = event => {
        if (!element.contains(event.target)) {
            handler();
            removeClickListener();
        }
    };

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener);
    };

    document.addEventListener('click', outsideClickListener);
}

type ActionProps = {
    action: HeaderAction,
    isContextMenu?: boolean
};

const HeaderActionItem = component$((props:ActionProps) => {
    const { action, isContextMenu } = props;
    const className = isContextMenu ? styles.contextOption : styles.headerButton;
    const app = useContext(appContext);
    const { successToast, caption, handler } = action;

    const onClick = $(async () => {
        if (!handler) return logger.error(`No handler for ${caption}`);
        await handler();
        if (successToast) {
            const toastId = `${caption}.toast`;

            app.toasts[toastId] = {
                id   : toastId,
                type : 'success',
                text : successToast
            };
        }
    });

    return action.handler
        ? <Button
            icon={true}
            class={className}
            onClick={onClick}
            disabled={action.disabled ? action.disabled.value : false}
        >
            <Icon name={action.icon}/>
            {isContextMenu && <span>{action.caption}</span>}
        </Button>
        : <Link class={className} href={action.link}>
            <Icon name={action.icon}/>
            {isContextMenu && <span>{action.caption}</span>}
        </Link>;
});

export default component$((props: Props) => {
    const session = useContext(sessionContext);
    const app = useContext(appContext);
    const location = useLocation();
    const avatarLoadFailed = useSignal(false);
    const headerButtonsPanel = useSignal<Element>();
    const contextMenuOptions = useSignal<Element>();
    const itemsInPanel = useSignal(DEFAULT_HEADER_BUTTONS_COUNT);

    const { actions = [] } = props;
    const needRecalcButtons = actions.length > 0;
    const needOpenContextMenu = useSignal(false);

    const isLoginPage = location.url.pathname.includes('/login');

    useVisibleTask$(({ track }) => {
        const elem = headerButtonsPanel.value;

        if (!elem || !needRecalcButtons) return;
        const panelWidth = elem.clientWidth;

        itemsInPanel.value = Math.floor(panelWidth / HEADER_BUTTON_WIDTH);

        const isMenuOpen = track(() => needOpenContextMenu.value);

        if (isMenuOpen) {
            onClickOutside(contextMenuOptions.value, () => needOpenContextMenu.value = false);
        }
    });

    const visibleActions = actions.filter(a => a.visible ? a.visible.value : true);
    const actionsForContextMenu = visibleActions.slice(itemsInPanel.value, visibleActions.length);

    const onOpenContextMenu = $(() => needOpenContextMenu.value = !needOpenContextMenu.value);

    return (
        <header class={[ styles.container, props.class ]}>
            <div class={styles.menu} onClick$={() => app.isMenuOpened = !app.isMenuOpened}>
                <Hamburger class={styles.hamburger} isOpened={app.isMenuOpened}/>
            </div>
            <div class={styles.mainContent}>
                <div class={styles.hamburgerSlot}></div>
                <Slot />
            </div>
            <div ref={headerButtonsPanel} class={styles.headerButtonsPanel}>
                <div class={styles.headerButtons}>
            {...visibleActions.slice(0, itemsInPanel.value).map((action) =>
                <HeaderActionItem
                    key={`${action.icon}${action.caption}`}
                    action={action}
                />)}
                </div>
            </div>
            {
                session.user.value
                    ? <Link href='/profile'>
                        {
                            (session.user.value.avatar && !avatarLoadFailed.value)
                                ? <img
                                    onError$={() => avatarLoadFailed.value = true}
                                    src={session.user.value.avatar}
                                    class={styles.avatar}
                                    crossOrigin='anonymous'
                                />
                                : <Avatar seed={getAvatarSeed(session.user.value.id)} class={styles.avatar}/>
                        }
                    </Link>
                    : !isLoginPage && <Link href='/login' class={styles.avatar}><SignInIcon/></Link>
            }
            {
                (actionsForContextMenu.length > 0) &&
                <Button
                    class={styles.contextMenu}
                    icon={true}
                    onClick={onOpenContextMenu}>
                    <ContextMenu/>
                </Button>
            }
            {
                needOpenContextMenu.value && (actionsForContextMenu.length > 0) &&
                    <div ref={contextMenuOptions} class={styles.contextMenuOptions}>
                        {...actionsForContextMenu.map((action) =>
                            <HeaderActionItem
                                key={`${action.icon}${action.caption}`}
                                action={action}
                                isContextMenu={true}
                            />)
                        }
                    </div>
            }
        </header>
    );
});
