import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$ } from '@builder.io/qwik-city';
import EditPage from '~/components/RecipeSinglePage/EditPage';
import Header from '~/components/RecipeSinglePage/EditHeader';
import { getRecipePlaceHolder } from '~/utils/recipe';
import Page from '~/components/Page';
import { fields, addSignal } from '~/components/RecipeSinglePage/fields';

export const useCreate = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}`);
});

export default component$(() => {
    const onSave = useCreate();
    const recipe = getRecipePlaceHolder();

    const fieldSignals = fields.map(f => addSignal(f, recipe));

    return <Page>
        <Header q:slot='header' fields={fieldSignals} onSave={onSave} recipe={recipe}/>
        <EditPage q:slot='content' fields={fieldSignals}/>
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.recipeCreate.head_title`
};

