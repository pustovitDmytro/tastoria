/* eslint-disable qwik/use-method-usage */
import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import type { Receipt, ReceipFilter } from '~/types';
import List from '~/components/RecipesList/RecipesList';
import firebase from '~/firebase';
import FilterInput from '~/components/FilterInput';

function fill(resultArray, category, id) {
    const found  = resultArray.find(t => t.value === category);

    if (found) {
        found.items.push(id);
    } else {
        resultArray.push({ value: category, items: [ id ] });
    }
}

export const useRecipesDetails = routeLoader$(async ({ cookie }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;
    const result = {
        list       : [] as Receipt[],
        tags       : [] as ReceipFilter[],
        categories : [] as ReceipFilter[]
    };

    if (!user) return result;

    result.list = await firebase.downloadRecipes(user.id);

    result.list.forEach(r => {
        r.tags.forEach(tag => fill(result.tags, tag, r.id));
        r.categories.forEach(tag => fill(result.categories, tag, r.id));
    });

    return result;
});

export function handleVisibility(recipe, search, { categories, tags }) {
    const needSearch = !!search;
    const bySearch = needSearch && search.split(/\s+/)
        .every(word => recipe.title.includes(word));

    let isVisible = true;

    if (needSearch && !bySearch) isVisible = false;
    if (categories.length > 0 &&
        (!recipe.categories || !categories.some(c => recipe.categories.includes(c.value)))
    ) isVisible = false;
    if (tags.length > 0 &&
        (!recipe.tags || !tags.some(c => recipe.tags.includes(c.value)))
    ) isVisible = false;

    // eslint-disable-next-line no-param-reassign
    recipe.isVisible.value = isVisible;
}

export default component$(() => {
    const result = useRecipesDetails();
    const search = useSignal('');
    const options = [
        ...result.value.categories.map(r => ({ label: `${r.value} (${r.items.length})`, id: `category_${r.value}`, isSelected: useSignal(false) })),
        ...result.value.tags.map(r => ({ label: `${r.value} (${r.items.length})`, id: `tags_${r.value}`, isSelected: useSignal(false) }))
    ];
    const list = result.value.list.map(r => ({ ...r, isVisible: useSignal(true) }));

    useTask$(({ track }) => {
        track(() => search.value + options.filter(o => o.isSelected.value).map(o => o.id).join(' '));
        const selected = new Set(options.filter(o => o.isSelected.value).map(o => o.id));

        const categories = result.value.categories.filter(c => selected.has(`category_${c.value}`));
        const tags = result.value.tags.filter(c => selected.has(`tags_${c.value}`));

        for (const recipe of list) {
            handleVisibility(recipe, search.value, { categories, tags });
        }
    });

    return (
        <>
            <FilterInput
                search={search}
                options={options}
            />
            <List data={list.filter(l => l.isVisible.value)}/>
        </>
    );
});

export const head: DocumentHead = {
    title : 'Recipes'
};

