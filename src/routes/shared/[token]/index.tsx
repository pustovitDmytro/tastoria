/* eslint-disable qwik/valid-lexical-scope */
import { component$, useContext, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import firebase from '~/firebase';
import Cipher from '~/utils/aes';
import { slotContext } from '~/stores';
import HeaderContent from '~/components/RecipeSinglePage/Header';
import Page from '~/components/RecipeSinglePage/Page';

export const useRecipesDetails = routeLoader$(async ({ params, env, cookie, redirect }) => {
    const sharedToken = params.token;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });
    const [ userId, recipeId ] = await cipher.decrypt(sharedToken);
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (user?.id === userId) {
        throw redirect(302, `/recipes/${recipeId}`);
    }

    const recipe = await firebase.downloadRecipe(userId, recipeId);

    if (!recipe) return null;

    return { recipe, sharedToken, sharedBy: userId };
});


export default component$(() => {
    const signal = useRecipesDetails();

    if (!signal.value) return <div>{$localize `pages.shared.notfound`}</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);
    const recipe = signal.value.recipe;

    useVisibleTask$(({ cleanup }) => {
        slotCtx.header = <HeaderContent recipe={signal.value.recipe} shareURL={sharedUrl}/>;
        cleanup(() => slotCtx.header = null);
    });

    return <Page recipe={recipe} shareURL={sharedUrl} sharedBy={signal.value.sharedBy}/>;
});


export const head: DocumentHead = ({ resolveValue }) => {
    const resolved = resolveValue(useRecipesDetails);

    return {
        title : resolved ? resolved.recipe.title : $localize `pages.shared.head_title`
    };
};
