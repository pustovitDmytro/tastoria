/* eslint-disable qwik/use-method-usage */
/* eslint-disable qwik/valid-lexical-scope */
import type { NoSerialize } from '@builder.io/qwik';
import { $, component$, noSerialize, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import type { ActionStore } from '@builder.io/qwik-city';
import { random } from 'myrmidon';
import FilterInput from '../FilterInput';
import styles from './Header.module.css';
import type { ReceipFilter, Receipt } from '~/types';
import RandomIcon from '~/components/Icons/random.svg';
import Button from '~/components/Button';
import { recipesContext } from '~/stores';

interface HeaderProps {
    list: Receipt[];
    onOpenRecipy: ActionStore<never,  Record<string, unknown>, true>
}

function fill(resultArray, category, id) {
    const found  = resultArray.find(t => t.value === category);

    if (found) {
        found.items.push(id);
    } else {
        resultArray.push({ value: category, items: [ id ] });
    }
}

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

export default component$<HeaderProps>((props) => {
    const { list, onOpenRecipy } = props;
    const search = useSignal('');
    const recipyContext = useContext(recipesContext);
    const result = {
        tags       : [] as ReceipFilter[],
        categories : [] as ReceipFilter[]
    };

    recipyContext.list.value.forEach(r => {
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

        for (const recipe of list) {
            handleVisibility(recipe, search.value, { categories, tags });
        }
    });

    const handleRandom = $(() => {
        const available = list.filter(l => l.isVisible.value);
        const randIndex = random.int(available.length - 1, 0);

        const selected = available[randIndex];

        onOpenRecipy.submit({ ...selected });
    });

    return (
        <div class={styles.header}>
            <FilterInput
                class={styles.search}
                search={search}
                options={options}
            />
            <div class={styles.headerButtons}>
                <Button
                    icon={true}
                    class={styles.headerButton}
                    onClick={handleRandom}
                >
                    <RandomIcon/>
                </Button>
            </div>
        </div>
    );
});
