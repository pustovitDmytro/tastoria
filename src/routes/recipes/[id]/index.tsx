import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, server$, useLocation } from '@builder.io/qwik-city';
import firebase from '~/firebase';
import Cipher from '~/aes';
import { slotContext } from '~/stores';
import HeaderContent from '~/components/ReceiptPage/Header';
import Page from '~/components/ReceiptPage/Page';

export const useRecipesDetails = routeLoader$(async ({ cookie, params, env }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return null;
    const recipyId = params.id;
    const receipt = await firebase.downloadRecipy(user.id, recipyId);

    if (!receipt) return null;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });

    const sharedToken =  await cipher.encrypt([
        user.id,
        recipyId,
        Date.now()
    ]);

    return { receipt, sharedToken };
});


export default component$(() => {
    const signal = useRecipesDetails();

    if (!signal.value) return <div>Not Found</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);
    const receipt = signal.value.receipt;

    useVisibleTask$(() => {
        // eslint-disable-next-line qwik/valid-lexical-scope
        slotCtx.header = <HeaderContent receipt={receipt} shareURL={sharedUrl}/>;
    });


    return <Page receipt={receipt} shareURL={sharedUrl}/>;
});


export const head: DocumentHead = ({ resolveValue }) => {
    const resolved = resolveValue(useRecipesDetails);

    return {
        title : resolved ? resolved.receipt.title : 'Tastoria Receipt'
    };
};

