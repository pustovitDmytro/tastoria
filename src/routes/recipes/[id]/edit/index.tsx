import {  component$, useContext, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$ } from '@builder.io/qwik-city';
import { recipesContext } from '~/stores';
import cookiesManager from '~/cookiesManager';
import Page from '~/components/Page';
import EditPage from '~/components/RecipeSinglePage/EditPage';
import Header from '~/components/RecipeSinglePage/EditHeader';
import { addSignal, fields } from '~/components/RecipeSinglePage/fields';
import Stub from '~/components/RecipeSinglePage/Stub';

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
    const onSave = useEdit();
    const signal = useRecipesDetails();
    const recipeContext = useContext(recipesContext);

    if (!signal.value) return <Stub title={$localize `pages.recipeEdit.notfound`}/>;
    const recipe = recipeContext.all[signal.value.recipeId];

    const fieldSignals = fields.map(f => addSignal(f, recipe));

    useVisibleTask$(() => {
        document.title = `* ${recipe.title}`;
    });

    return <Page>
        <Header q:slot='header' fields={fieldSignals} onSave={onSave} recipe={recipe}/>
        <EditPage q:slot='content' fields={fieldSignals} recipe={recipe}/>
    </Page>;
});


export const head: DocumentHead = {
    title : $localize `pages.recipeEdit.head_title`
};

