import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
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


export default component$(() => {
    const signal = useRecipesDetails();
    const recipyContext = useContext(recipesContext);

    const receipt = recipyContext.list.value.find(r => r.id === signal.value?.recipyId);

    if (!receipt || !signal.value) return <div>{$localize `pages.recipy.notfound`}</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);

    useVisibleTask$(() => {
        // eslint-disable-next-line qwik/valid-lexical-scope
        slotCtx.header = <HeaderContent receipt={receipt} shareURL={sharedUrl}/>;
    });


    return <Page receipt={receipt} shareURL={sharedUrl}/>;
});


export const head: DocumentHead = ({ resolveValue }) => {
    const resolved = resolveValue(useRecipesDetails);

    return {
        title : $localize `pages.recipy.head_title`
    };
};

