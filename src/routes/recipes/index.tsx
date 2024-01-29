/* eslint-disable qwik/valid-lexical-scope */
/* eslint-disable qwik/use-method-usage */
import { component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { routeAction$, type DocumentHead } from '@builder.io/qwik-city';
import type { ReceipFilter, Receipt } from '~/types';
import List from '~/components/RecipesPage/RecipesList';
import Header from '~/components/RecipesPage/Header';
import { recipesContext, slotContext } from '~/stores';

export const useOpenRecipy = routeAction$((recipy, { redirect }) => {
    throw redirect(302, `/recipes/${recipy.id}`);
});

export default component$(() => {
    const recipyContext = useContext(recipesContext);
    const slotCtx = useContext(slotContext);
    const onOpenRecipy = useOpenRecipy();

    const list = recipyContext.list.value.map(r => ({ ...r, isVisible: useSignal(true) }));

    useVisibleTask$(({ cleanup }) => {
        slotCtx.header = <Header
            list={list}
            onOpenRecipy={onOpenRecipy}
        />;
        cleanup(() => slotCtx.header = null);
    });

    return (
        <List data={list.filter(l => l.isVisible.value)}/>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.recipyList.head_title`
};
