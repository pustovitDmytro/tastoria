/* eslint-disable sonarjs/no-nested-template-literals */
import type { NoSerialize } from '@builder.io/qwik';
import { $, component$, noSerialize, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { isFunction } from 'myrmidon';
import type { ActionStore } from '@builder.io/qwik-city';
import { v4 as uuid } from 'uuid';
import type { Recipe } from '~/types';
import { recipesContext, appContext } from '~/stores';
import Header from '~/components/Header/header';

const version = TASTORIA_BUILD.VERSION;

interface HeaderProps {
    recipe: Recipe;
    shareURL: URL,
    onRemove?: ActionStore<never, Record<string, unknown>, true>
    onDuplicate?: ActionStore<never, Record<string, unknown>, true>
    sharedBy?: string
}

function prepareSharedText(recipe: Recipe) {
    const lines = [ recipe.title ];

    lines.push('', `${$localize `component.RecipePage_ViewHeader.ingredientsLabel`}:`);
    recipe.ingredients.map(i => lines.push(i));
    lines.push('', `${$localize `component.RecipePage_ViewHeader.stepsLabel`}:`);
    recipe.steps.map((s, i) => lines.push(`${i + 1}. ${s}`));

    return lines.join('\n');
}

// eslint-disable-next-line max-lines-per-function
export default component$<HeaderProps>((props) => {
    const { recipe, onRemove, onDuplicate, sharedBy } = props;
    const isLocked = useSignal(false);
    const wakeLock = useSignal<NoSerialize<WakeLockSentinel> | null>(null);
    const recipeContext = useContext(recipesContext);
    const app = useContext(appContext);

    const canBeShared = useSignal(false);
    const canBeLocked = useSignal(false);

    useVisibleTask$(() => {
        canBeLocked.value = !!navigator.wakeLock;
        canBeShared.value = isFunction(navigator.share) || isFunction(navigator.clipboard.writeText);
    });

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

        if (isFunction(navigator.clipboard.writeText)) {
            navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
            const toastId = `${recipe.id}.clipboard`;

            app.toasts[toastId] = {
                id   : toastId,
                type : 'success',
                text : $localize `component.RecipePage_ViewHeader.copied_to_clipboard`
            };
        }
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

    const lockBtn = {
        visible      : useSignal(canBeLocked.value && !isLocked.value),
        handler      : handleLockClick,
        icon         : 'lock',
        caption      : $localize `component.RecipePage_ViewHeader.lock_caption`,
        // eslint-disable-next-line no-secrets/no-secrets
        successToast : $localize `component.RecipePage_ViewHeader.lock_successToast`
    };
    const unLockBtn = {
        visible      : useSignal(canBeLocked.value && !isLocked.value),
        handler      : handleLockClick,
        icon         : 'unlock',
        caption      : $localize `component.RecipePage_ViewHeader.unlock_caption`,
        // eslint-disable-next-line no-secrets/no-secrets
        successToast : $localize `component.RecipePage_ViewHeader.unLock_successToast`
    };
    const shareBtn = {
        visible : canBeShared,
        handler : handleShareClick,
        icon    : 'share',
        caption : $localize `component.RecipePage_ViewHeader.shareBtn_caption`
    };
    const printBtn = {
        handler : handlePrintClick,
        icon    : 'print',
        caption : $localize `component.RecipePage_ViewHeader.print_caption`
    };

    const editBtn = {
        visible : useSignal(!sharedBy),
        link    : `/recipes/${recipe.id}/edit`,
        icon    : 'edit',
        caption : $localize `component.RecipePage_ViewHeader.edit_caption`
    };

    const removeBtn = {
        visible : useSignal(!!onRemove),
        handler : $(async () => {
            if (!onRemove) return;
            await handleRemove();

            onRemove.submit();
        }),
        icon         : 'delete',
        caption      : $localize `component.RecipePage_ViewHeader.remove_caption`,
        successToast : $localize `component.RecipePage_ViewHeader.remove_successToast`
    };

    const duplicateBtn = {
        visible : useSignal(!!onDuplicate),
        handler : $(async () => {
            if (!onDuplicate) return;
            const duplicated = await handleDuplicate();

            onDuplicate.submit(duplicated);
        }),
        icon         : 'duplicate',
        caption      : $localize `component.RecipePage_ViewHeader.duplicate_caption`,
        // eslint-disable-next-line no-secrets/no-secrets
        successToast : $localize `component.RecipePage_ViewHeader.duplicate_successToast`
    };

    return <Header
        actions={[ lockBtn, unLockBtn, shareBtn, printBtn, editBtn, removeBtn, duplicateBtn ]}
    />;
});

