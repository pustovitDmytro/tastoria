/* eslint-disable qwik/valid-lexical-scope */
import type { NoSerialize } from '@builder.io/qwik';
import { $, component$, noSerialize, useContext, useSignal } from '@builder.io/qwik';
import { isFunction } from 'myrmidon';
import type { ActionStore } from '@builder.io/qwik-city';
import { v4 as uuid } from 'uuid';
import { version } from '../../../package.json';
import styles from './recipe.module.css';
import type { Recipe } from '~/types';
import ShareIcon from '~/components/Icons/share.svg?component';
import LockIcon from '~/components/Icons/lock.svg?component';
import UnlockIcon from '~/components/Icons/unlock.svg?component';
import PrintIcon from '~/components/Icons/print.svg?component';
import DeleteIcon from '~/components/Icons/delete.svg';
import EditIcon from '~/components/Icons/edit.svg';
import DuplicateIcon from '~/components/Icons/duplicate.svg';
import Button from '~/components/Button';
import { recipesContext } from '~/stores';

interface HeaderProps {
    recipe: Recipe;
    shareURL: URL,
    onEdit?: ActionStore<never, Record<string, unknown>, true>
    onRemove?: ActionStore<never, Record<string, unknown>, true>
    onDuplicate?: ActionStore<never, Record<string, unknown>, true>
}

function prepareSharedText(recipe: Recipe) {
    const lines = [ recipe.title ];

    lines.push('', $localize `component.RecipePage_ViewHeader.ingredientsLabel`);
    recipe.ingredients.map(i => lines.push(i));
    lines.push('', $localize `component.RecipePage_ViewHeader.stepsLabel`);
    recipe.steps.map((s, i) => lines.push(`${i + 1}. ${s}`));

    return lines.join('\n');
}

// eslint-disable-next-line max-lines-per-function
export default component$<HeaderProps>((props) => {
    const { recipe, onRemove, onDuplicate, onEdit } = props;
    const isLocked = useSignal(false);
    const wakeLock = useSignal<NoSerialize<WakeLockSentinel> | null>(null);
    const recipeContext = useContext(recipesContext);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const canBeShared = isFunction(navigator.share) || isFunction(navigator.clipboard.writeText);
    const canBeLocked = !!navigator.wakeLock;

    const shareData = {
        title : $localize `component.RecipePage_ViewHeader.title`,
        text  : prepareSharedText(recipe),
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

    const handleDuplicate = $(() => {
        const duplicated = {
            ...recipe,
            id : uuid(),
            version,

            visits   : 0,
            favorite : false,

            createdAt : (new Date()).toISOString(),
            updatedAt : (new Date()).toISOString()
        };

        recipeContext.all[duplicated.id] = duplicated;
        recipeContext.lastChanged.value = new Date();

        return duplicated;
    });

    const handleRemove = $(() => {
        recipe.deletedAt = (new Date()).toISOString();
        recipe.updatedAt = (new Date()).toISOString();
        recipeContext.lastChanged.value = new Date();
    });

    return <div class={styles.header}>
        <h1></h1>
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
            {
                onEdit && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={$(() => onEdit.submit())}
                >
                    <EditIcon/>
                </Button>
            }
            {
                onRemove && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={$(async () => {
                        await handleRemove();

                        onRemove.submit();
                    })}
                >
                    <DeleteIcon/>
                </Button>
            }
            {
                onDuplicate && <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={$(async () => {
                        const duplicated = await handleDuplicate();

                        onDuplicate.submit(duplicated);
                    })}
                >
                    <DuplicateIcon/>
                </Button>
            }
        </div>
    </div>;
});

