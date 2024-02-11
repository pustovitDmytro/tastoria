import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import { recipesContext } from '~/stores';
import Page from '~/components/RecipeSinglePage/EditPage';
import cookiesManager from '~/cookiesManager';

export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = await cookiesManager.getSession(cookie, env);

    if (!session) return null;
    const recipeId = params.id;

    return { recipeId };
});

export const useEdit = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}`);
});

export default component$(() => {
    const signal = useRecipesDetails();
    const recipeContext = useContext(recipesContext);
    const onSave = useEdit();

    if (!signal.value) return <div>{$localize `pages.recipeEdit.notfound`}</div>;

    const recipe = recipeContext.all[signal.value.recipeId];

    if (!recipe) return <div>{$localize `pages.recipeEdit.notfound`}</div>;

    return <Page
        recipe={recipe}
        onSave={onSave}
    />;
});

export const head: DocumentHead = {
    title : $localize `pages.recipeEdit.head_title`
};

