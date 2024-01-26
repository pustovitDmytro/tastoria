/* eslint-disable qwik/valid-lexical-scope */
import type { NoSerialize } from '@builder.io/qwik';
import { $, component$, noSerialize, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { isFunction } from 'myrmidon';
import styles from './recipy.module.css';
import type { Receipt } from '~/types';
import ShareIcon from '~/components/Icons/share.svg?component';
import LockIcon from '~/components/Icons/lock.svg?component';
import UnlockIcon from '~/components/Icons/unlock.svg?component';
import PrintIcon from '~/components/Icons/print.svg?component';
import Button from '~/components/Button';

interface HeaderProps {
    receipt: Receipt;
    shareURL: URL
}

function prepareSharedText(receipt: Receipt) {
    const lines = [ receipt.title ];

    lines.push('', $localize `component.ReciptPage_Header.ingredientsLabel`);
    receipt.ingredients.map(i => lines.push(i));
    lines.push('', $localize `component.ReciptPage_Header.stepsLabel`);
    receipt.steps.map((s, i) => lines.push(`${i + 1}. ${s}`));

    return lines.join('\n');
}

export default component$<HeaderProps>((props) => {
    const { receipt } = props;
    const isLocked = useSignal(false);
    const wakeLock = useSignal<NoSerialize<WakeLockSentinel> | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const canBeShared = isFunction(navigator.share) || isFunction(navigator.clipboard.writeText);
    const canBeLocked = !!navigator.wakeLock;

    const shareData = {
        title : $localize `component.ReciptPage_Header.title`,
        text  : prepareSharedText(receipt),
        url   : props.shareURL.href
    };

    const handleLockClick = $(async () => {
        function onLockRelease() {
            isLocked.value = false;
        }

        if (isLocked.value && wakeLock.value) {
            wakeLock.value.release();
        } else {
            /* eslint-disable require-atomic-updates */
            const w = await navigator.wakeLock.request('screen');

            isLocked.value = true;

            w.addEventListener('release', onLockRelease);
            wakeLock.value = noSerialize(w);
            /* eslint-enable require-atomic-updates */
        }
    });

    const handleShareClick = $(() => {
        if (isFunction(navigator.share)) navigator.share(shareData);

        if (isFunction(navigator.clipboard.writeText)) navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
    });

    const handlePrintClick = $(() => {
        window.print();
    });

    return <div class={styles.header}>
        <h1>{receipt.title}</h1>
        <div class={styles.headerButtons}>
            {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                canBeLocked && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={handleLockClick}
                >
                    { isLocked.value ? <UnlockIcon/> : <LockIcon/> }
                </Button>
            }
            {
                canBeShared && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={handleShareClick}
                >
                    <ShareIcon/>
                </Button>
            }
            <Button
                icon={true}
                class={styles.headerButton}
                onClick={handlePrintClick}
            >
                <PrintIcon/>
            </Button>
        </div>
    </div>;
});

