/* eslint-disable qwik/valid-lexical-scope */
import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$, routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import Cipher from '~/utils/aes';
import { slotContext, recipesContext } from '~/stores';
import HeaderContent from '~/components/ReceiptPage/Header';
import Page from '~/components/ReceiptPage/Page';

export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return null;
    const recipyId = params.id;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });

    const sharedToken =  await cipher.encrypt([
        user.id,
        recipyId,
        Date.now()
    ]);

    return { sharedToken, recipyId };
});

export const useRemove = routeAction$((recipy, { redirect }) => {
    throw redirect(302, '/recipes');
});

export const useEdit = routeAction$((recipy, { redirect, params }) => {
    throw redirect(302, `/recipes/${params.id}/edit`);
});

export const useDuplicate = routeAction$((recipy, { redirect }) => {
    throw redirect(302, `/recipes/${recipy.id}/edit`);
});


export default component$(() => {
    const signal = useRecipesDetails();
    const recipyContext = useContext(recipesContext);

    const receipt = recipyContext.list.value.find(r => r.id === signal.value?.recipyId);

    if (!receipt || !signal.value) return <div>{$localize `pages.recipy.notfound`}</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);

    const onRemove = useRemove();
    const onEdit = useEdit();
    const onDuplicate = useDuplicate();

    useVisibleTask$(({ cleanup }) => {
        slotCtx.header = <HeaderContent
            receipt={receipt}
            shareURL={sharedUrl}
            onRemove={onRemove}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
        />;
        document.title = receipt.title;
        cleanup(() => slotCtx.header = null);
    });


    return <Page
        receipt={receipt}
        shareURL={sharedUrl}
    />;
});

export const head: DocumentHead = {
    title : $localize `pages.recipy.head_title`
};

