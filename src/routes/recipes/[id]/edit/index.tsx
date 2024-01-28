import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import { recipesContext } from '~/stores';
import Page from '~/components/ReceiptPage/EditPage';

export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return null;
    const recipyId = params.id;

    return { recipyId };
});

export const useEdit = routeAction$((recipy, { redirect, params }) => {
    throw redirect(302, `/recipes/${params.id}`);
});

export default component$(() => {
    const signal = useRecipesDetails();
    const recipyContext = useContext(recipesContext);
    const onSave = useEdit();

    const receipt = recipyContext.list.value.find(r => r.id === signal.value?.recipyId);

    if (!receipt || !signal.value) return <div>{$localize `pages.recipyEdit.notfound`}</div>;

    return <Page
        receipt={receipt}
        onSave={onSave}
    />;
});

export const head: DocumentHead = {
    title : $localize `pages.recipyEdit.head_title`
};

