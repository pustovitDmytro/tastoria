/* eslint-disable qwik/valid-lexical-scope */
import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { isFunction } from 'myrmidon';
import styles from './recipy.module.css';
import type { Receipt } from '~/types';
import ShareIcon from '~/components/Icons/share.svg?component';
import LockIcon from '~/components/Icons/lock.svg?component';
import UnlockIcon from '~/components/Icons/unlock.svg?component';
import Button from '~/components/Button';

interface HeaderProps {
    receipt: Receipt;
    shareURL: URL
}

export default component$<HeaderProps>((props) => {
    const { receipt } = props;
    const isLocked = useSignal(false);
    const wakeLock = useSignal<WakeLockSentinel | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const canBeShared = isFunction(navigator.share);
    const canBeLocked = isFunction(navigator.wakeLock);

    const shareData = {
        title : 'Tastoria Receipt',
        text  : receipt.title,
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

