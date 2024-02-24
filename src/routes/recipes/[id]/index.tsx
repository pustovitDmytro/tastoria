/* eslint-disable qwik/valid-lexical-scope */
import { component$, useContext, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import Cipher from '~/utils/aes';
import { recipesContext } from '~/stores';
import Header from '~/components/RecipeSinglePage/Header';
import ViewPage from '~/components/RecipeSinglePage/Page';
import cookiesManager from '~/cookiesManager';
import Page from '~/components/Page';
import Stub from '~/components/RecipeSinglePage/Stub';

export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = await cookiesManager.getSession(cookie, env);

    if (!session) return null;
    const recipeId = params.id;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });

    const sharedToken =  await cipher.encrypt([
        session.userId,
        recipeId,
        Date.now()
    ]);

    return { sharedToken, recipeId };
});

export const useRemove = routeAction$((recipe, { redirect }) => {
    throw redirect(302, '/recipes');
});

export const useDuplicate = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}/edit`);
});

export default component$(() => {
    const signal = useRecipesDetails();
    const recipeContext = useContext(recipesContext);

    if (!signal.value) return <Stub title={$localize `pages.recipe.notfound`}/>;
    const recipe = recipeContext.all[signal.value.recipeId];

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!recipe) return <Stub title={$localize `pages.recipe.notfound`}/>;
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);

    const onRemove = useRemove();
    const onDuplicate = useDuplicate();

    useVisibleTask$(() => {
        document.title = recipe.title;
    });

    return <Page>
        <Header
            q:slot='header'
            recipe={recipe}
            shareURL={sharedUrl}
            onRemove={onRemove}
            onDuplicate={onDuplicate}
        />
        <ViewPage
            q:slot='content'
            recipe={recipe}
            shareURL={sharedUrl}
        />
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.recipe.head_title`
};

