/* eslint-disable qwik/valid-lexical-scope */
import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import Cipher from '~/utils/aes';
import { slotContext, recipesContext } from '~/stores';
import HeaderContent from '~/components/RecipeSinglePage/Header';
import Page from '~/components/RecipeSinglePage/Page';

export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return null;
    const recipeId = params.id;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });

    const sharedToken =  await cipher.encrypt([
        user.id,
        recipeId,
        Date.now()
    ]);

    return { sharedToken, recipeId };
});

export const useRemove = routeAction$((recipe, { redirect }) => {
    throw redirect(302, '/recipes');
});

export const useEdit = routeAction$((recipe, { redirect, params }) => {
    throw redirect(302, `/recipes/${params.id}/edit`);
});

export const useDuplicate = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}/edit`);
});


export default component$(() => {
    const signal = useRecipesDetails();
    const recipeContext = useContext(recipesContext);

    if (!signal.value) return <div>{$localize `pages.recipe.notfound`}</div>;
    const recipe = recipeContext.all[signal.value.recipeId];

    if (!recipe) return <div>{$localize `pages.recipe.notfound`}</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);

    const onRemove = useRemove();
    const onEdit = useEdit();
    const onDuplicate = useDuplicate();

    useVisibleTask$(({ cleanup }) => {
        slotCtx.header = <HeaderContent
            recipe={recipe}
            shareURL={sharedUrl}
            onRemove={onRemove}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
        />;
        document.title = recipe.title;
        cleanup(() => slotCtx.header = null);
    });


    return <Page
        recipe={recipe}
        shareURL={sharedUrl}
    />;
});

export const head: DocumentHead = {
    title : $localize `pages.recipe.head_title`
};

