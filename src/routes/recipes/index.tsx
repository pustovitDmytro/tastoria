/* eslint-disable qwik/valid-lexical-scope */
import { component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeAction$, type DocumentHead } from '@builder.io/qwik-city';
import List from '~/components/RecipesListPage/RecipesList';
import Header from '~/components/RecipesListPage/Header';
import Stub from '~/components/RecipesListPage/Stub';
import { recipesContext, slotContext } from '~/stores';
import { recipyFavoriteSorter } from '~/utils/sorter';

export const useOpenRecipe = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}`);
});

export default component$(() => {
    const recipeContext = useContext(recipesContext);
    const slotCtx = useContext(slotContext);
    const onOpenRecipe = useOpenRecipe();

    const list = Object.values(recipeContext.all)
        .map(r => ({
            recipe    : r,
            sorter    : recipyFavoriteSorter(r),
            // eslint-disable-next-line qwik/use-method-usage
            isVisible : useSignal(true)
        }));

    useVisibleTask$(({ cleanup }) => {
        slotCtx.header = <Header
            list={list}
            onOpenRecipe={onOpenRecipe}
        />;
        cleanup(() => slotCtx.header = null);
    });

    const dataToShow = list.filter(l => l.isVisible.value && !l.recipe.deletedAt);

    if (dataToShow.length === 0) {
        const isFiltered = list.some(l => l.isVisible.value === false && !l.recipe.deletedAt);

        return <Stub isFiltered={isFiltered}/>;
    }

    return (
        <List
            data={
                dataToShow
                    .sort((a, b) => b.sorter - a.sorter)
                    .map(r => r.recipe)
            }
        />
    );
});

export const head: DocumentHead = {
    title : $localize `pages.recipeList.head_title`
};
