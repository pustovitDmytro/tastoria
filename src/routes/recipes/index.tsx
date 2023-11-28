import { component$, useContext  } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { Receipt } from '~/components/RecipesList/RecipesList';
import List from '~/components/RecipesList/RecipesList';
import firebase from '~/firebase';
import { sessionContext } from '~/stores/session';

export const useRecipesDetails = routeLoader$(async () => {
    try {
        const res = await firebase.downloadData();

        return (res.recipes as Receipt[]);
    } catch (error) {
        console.error(error);

        return [];
    }
});

export default component$(() => {
    const session = useContext(sessionContext);

    if (!session.user) return (<> User not found</>);

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

