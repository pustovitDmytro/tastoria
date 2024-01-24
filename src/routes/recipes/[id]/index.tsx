/* eslint-disable qwik/valid-lexical-scope */
import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import { isFunction } from 'myrmidon';
import styles from './recipy.module.css';
import type { Receipt } from '~/types';
import firebase from '~/firebase';
import Image from '~/components/Image/image';
import Cipher from '~/aes';
import { slotContext } from '~/stores';
import ShareIcon from '~/components/Icons/share.svg?component';
import LockIcon from '~/components/Icons/lock.svg?component';
import UnlockIcon from '~/components/Icons/unlock.svg?component';
import Button from '~/components/Button';


export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return null;
    const recipyId = params.id;
    const receipt = await firebase.downloadRecipy(user.id, recipyId);

    if (!receipt) return null;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });

    const sharedToken =  await cipher.encrypt([
        user.id,
        recipyId,
        Date.now()
    ]);

    return { receipt, sharedToken };
});


interface SourceProps {
    url?: string;
}

const Source = component$<SourceProps>((props) => {
    if (!props.url) return null;
    const url = new URL(props.url);

    return <div class={styles.contentItem}>
        <span class={styles.propertyLabel}>Source:</span>
        <a class={styles.source} href={url.href}>{url.host}</a>
    </div>;
});

interface HeaderProps {
    receipt: Receipt;
    shareURL: URL
}

export const HeaderContent = component$<HeaderProps>((props) => {
    const { receipt } = props;
    const isLocked = useSignal(false);
    const wakeLock = useSignal<WakeLockSentinel | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const canBeShared = isFunction(navigator.share);
    const canBeLocked = isFunction(navigator.wakeLock);

    const shareData = {
        title : receipt.title,
        text  : receipt.description,
        url   : props.shareURL.href
    };

    const handleLockClick = $(async () => {
        if (isLocked.value && wakeLock.value) {
            wakeLock.value.release();
        } else {
            isLocked.value = true;
            // eslint-disable-next-line require-atomic-updates
            wakeLock.value = await navigator.wakeLock.request('screen');
            wakeLock.value.addEventListener('release', (e) => {
                isLocked.value = false;
            });
        }
    });

    return <div class={styles.header}>
        <h1>{receipt.title}</h1>
        <div class={styles.headerButtons}>
            {
                canBeLocked && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={handleLockClick}
                >
                    {
                        isLocked.value ? <UnlockIcon/> : <LockIcon/>
                    }
                </Button>
            }
            {
                canBeShared && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={$(() => navigator.share(shareData))}
                >
                    <ShareIcon/>
                </Button>
            }
        </div>
    </div>;
});

export default component$(() => {
    const signal = useRecipesDetails();

    if (!signal.value) return <div>Not Found</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);

    useTask$(() => {
        // eslint-disable-next-line qwik/valid-lexical-scope
        slotCtx.header = <HeaderContent receipt={signal.value.receipt} shareURL={sharedUrl}/>;
    });

    const receipt = signal.value.receipt;

    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <Image src={receipt.image}/>
                <div class={styles.content}>
                    <h1>{receipt.title}</h1>
                    <div class={styles.contentItem}>
                        {receipt.description}
                    </div>
                    <div class={styles.contentItem}>
                        <span class={styles.propertyLabel} >Quantity:</span>
                        {receipt.quantity}
                    </div>
                    <Source url={receipt.url}/>
                </div>
            </div >
            <h2>Ingredients:</h2>
            <ul class={styles.ingredients}>
                {
                    receipt.ingredients.map(ing => <li key={ing}>
                        {ing}
                    </li>)
                }
            </ul>
            <h2>Steps:</h2>
            <ol class={styles.steps}>
                {
                    receipt.steps.map(step => <li key={step}>
                        {step}
                    </li>)
                }
            </ol>
        </div>
    );
});


export const head: DocumentHead = ({ resolveValue }) => {
    const resolved = resolveValue(useRecipesDetails);

    return {
        title : resolved ? resolved.receipt.title : 'Tastoria Receipt'
    };
};

