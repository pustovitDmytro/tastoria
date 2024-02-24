/* eslint-disable qwik/use-method-usage */
/* eslint-disable qwik/valid-lexical-scope */
import type {  Signal } from '@builder.io/qwik';
import { $, component$, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import { Link, type ActionStore } from '@builder.io/qwik-city';
import { random } from 'myrmidon';
import FilterInput from '../FilterInput';
import Header from '../Header/header';
import styles from './Header.module.css';
import { handleVisibility } from './utils';
import type { ReceipFilter, Recipe } from '~/types';
import { recipesContext } from '~/stores';

interface HeaderProps {
    list: {
        recipe: Recipe,
        isVisible: Signal<boolean>
    }[];
    onOpenRecipe: ActionStore<never,  Record<string, unknown>, true>
}

function fill(resultArray, category, id) {
    const found  = resultArray.find(t => t.value === category);

    if (found) {
        found.items.push(id);
    } else {
        resultArray.push({ value: category, items: [ id ] });
    }
}

export default component$<HeaderProps>((props) => {
    const { list, onOpenRecipe } = props;
    const search = useSignal('');
    const recipeContext = useContext(recipesContext);
    const result = {
        tags       : [] as ReceipFilter[],
        categories : [] as ReceipFilter[]
    };

    Object.values(recipeContext.all).filter(r => !r.deletedAt).forEach(r => {
        r.tags.forEach(tag => fill(result.tags, tag, r.id));
        r.categories.forEach(tag => fill(result.categories, tag, r.id));
    });

    const options = [
        ...result.categories.map(r => ({ label: `${r.value} (${r.items.length})`, id: `category_${r.value}`, isSelected: useSignal(false) })),
        ...result.tags.map(r => ({ label: `${r.value} (${r.items.length})`, id: `tags_${r.value}`, isSelected: useSignal(false) }))
    ];

    useTask$(({ track }) => {
        track(() => search.value + options.filter(o => o.isSelected.value).map(o => o.id).join(' '));
        const selected = new Set(options.filter(o => o.isSelected.value).map(o => o.id));

        const categories = result.categories.filter(c => selected.has(`category_${c.value}`));
        const tags = result.tags.filter(c => selected.has(`tags_${c.value}`));

        for (const r of list) {
            handleVisibility(r, search.value, { categories, tags });
        }
    });

    const handleRandom = $(() => {
        const available = list.filter(l => l.isVisible.value);

        const randIndex = random.int(available.length - 1, 0);

        const selected = available[randIndex];

        onOpenRecipe.submit({ ...selected.recipe });
    });

    const hasRecipes = list.some(l => l.isVisible.value);

    const randomBtn = {
        disabled : useSignal(!hasRecipes),
        handler  : handleRandom,
        icon     : 'random',
        caption  : $localize `component.RecipesListPage_Header.random_caption`
    };
    const createLink = {
        link    : '/recipes/create',
        icon    : 'add',
        caption : $localize `component.RecipesListPage_Header.create_caption`
    };


    return <Header
        actions={[ randomBtn, createLink ]}
    >
        <FilterInput
            class={styles.search}
            search={search}
            options={options}
        />
    </Header>;
});
