import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import { recipesContext } from '~/stores';
import Page from '~/components/RecipeSinglePage/EditPage';

export const useCreate = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}`);
});

export default component$(() => {
    const recipeContext = useContext(recipesContext);
    const onSave = useCreate();

    return <Page
        onSave={onSave}
    />;
});

export const head: DocumentHead = {
    title : $localize `pages.recipeCreate.head_title`
};

