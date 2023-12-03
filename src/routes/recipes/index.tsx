import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { Receipt } from '~/components/RecipesList/RecipesList';
import List from '~/components/RecipesList/RecipesList';
import firebase from '~/firebase';

export const useRecipesDetails = routeLoader$(async ({ cookie }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    const res = await firebase.downloadRecipes(user.id);

    return (res as Receipt[]);
});

export default component$(() => {
    const result = useRecipesDetails();

    return (
        <>
            <List data={result.value}/>
        </>
    );
});

export const head: DocumentHead = {
    title : 'Recipes'
};

