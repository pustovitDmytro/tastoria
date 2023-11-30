import { component$, useContext  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { Receipt } from '~/components/RecipesList/RecipesList';
import List from '~/components/RecipesList/RecipesList';
import firebase from '~/firebase';

export const useRecipesDetails = routeLoader$(async () => {
    const res = await firebase.downloadData();

    return (res.recipes as Receipt[]);
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
    title : 'Tastoria Recipes',
    meta  : [
        {
            name    : 'description',
            content : 'Main page'
        }
    ]
};

