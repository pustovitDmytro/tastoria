/* eslint-disable qwik/valid-lexical-scope */
import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, useLocation } from '@builder.io/qwik-city';
import FirebaseServer from '~/firebase/server';
import Cipher from '~/utils/aes';
import ViewPage from '~/components/RecipeSinglePage/Page';
import cookiesManager from '~/cookiesManager';
import Page from '~/components/Page';
import Header from '~/components/RecipeSinglePage/Header';
import Stub from '~/components/RecipeSinglePage/Stub';

export const useRecipesDetails = routeLoader$(async ({ params, env, cookie, redirect }) => {
    const sharedToken = params.token;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });
    const [ userId, recipeId ] = await cipher.decrypt(sharedToken);

    const session = await cookiesManager.getSession(cookie, env);

    if (session?.userId === userId) {
        throw redirect(302, `/recipes/${recipeId}`);
    }

    const firebaseServer = new FirebaseServer({ env });

    await firebaseServer.signIn(session?.token);
    const recipe = await firebaseServer.downloadRecipe(userId, recipeId);

    if (!recipe) return null;

    return { recipe, sharedToken, sharedBy: userId, isLoggedIn: !!session };
});

export const useDuplicate = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}/edit`);
});

export default component$(() => {
    const signal = useRecipesDetails();

    if (!signal.value) return <Stub title={$localize `pages.shared.notfound`}/>;
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);
    const recipe = signal.value.recipe;
    const onDuplicate = useDuplicate();

    return <Page>
        <Header
            q:slot='header'
            recipe={recipe}
            shareURL={sharedUrl}
            onDuplicate={signal.value.isLoggedIn ? onDuplicate : undefined}
            sharedBy={signal.value.sharedBy}
        />
        <ViewPage
            q:slot='content'
            recipe={recipe}
            shareURL={sharedUrl}
            sharedBy={signal.value.sharedBy}
        />
    </Page>;
});


export const head: DocumentHead = ({ resolveValue }) => {
    const resolved = resolveValue(useRecipesDetails);

    return {
        title : resolved ? resolved.recipe.title : $localize `pages.shared.head_title`
    };
};
