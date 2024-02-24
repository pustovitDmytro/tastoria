import { component$, useContext, useSignal } from '@builder.io/qwik';
import { routeAction$, type DocumentHead } from '@builder.io/qwik-city';
import List from '~/components/RecipesListPage/RecipesList';
import Header from '~/components/RecipesListPage/Header';
import Stub from '~/components/RecipesListPage/Stub';
import { recipesContext } from '~/stores';
import { recipyFavoriteSorter } from '~/utils/sorter';
import Page from '~/components/Page';

export const useOpenRecipe = routeAction$((recipe, { redirect }) => {
    throw redirect(302, `/recipes/${recipe.id}`);
});

export default component$(() => {
    const recipeContext = useContext(recipesContext);
    const onOpenRecipe = useOpenRecipe();

    const list = Object.values(recipeContext.all)
        .map(r => ({
            recipe    : r,
            sorter    : recipyFavoriteSorter(r),
            // eslint-disable-next-line qwik/use-method-usage
            isVisible : useSignal(true)
        }));

    const dataToShow = list.filter(l => l.isVisible.value && !l.recipe.deletedAt);

    if (dataToShow.length === 0) {
        const isFiltered = list.some(l => l.isVisible.value === false && !l.recipe.deletedAt);

        return <Stub isFiltered={isFiltered}/>;
    }

    return <Page>
        <Header
            q:slot='header'
            list={list}
            onOpenRecipe={onOpenRecipe}
        />
        <List
            q:slot='content'
            data={
                dataToShow
                    .sort((a, b) => b.sorter - a.sorter)
                    .map(r => r.recipe)
            }
        />
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.recipeList.head_title`
};
