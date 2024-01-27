import { component$, useContext, useVisibleTask$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$, useLocation } from '@builder.io/qwik-city';
import firebase from '~/firebase';
import Cipher from '~/utils/aes';
import { slotContext } from '~/stores';
import HeaderContent from '~/components/ReceiptPage/Header';
import Page from '~/components/ReceiptPage/Page';

export const useRecipesDetails = routeLoader$(async ({ params, env }) => {
    const sharedToken = params.token;
    const cipher = new Cipher({ key: env.get('SHARE_SECRET_KEY') });
    const [ userId, recipyId ] = await cipher.decrypt(sharedToken);
    const receipt = await firebase.downloadRecipy(userId, recipyId);

    if (!receipt) return null;

    return { receipt, sharedToken, sharedBy: userId };
});


export default component$(() => {
    const signal = useRecipesDetails();

    if (!signal.value) return <div>{$localize `pages.shared.notfound`}</div>;
    const slotCtx = useContext(slotContext);
    const location = useLocation();
    const sharedUrl = new URL(`shared/${signal.value.sharedToken}`, location.url.origin);
    const receipt = signal.value.receipt;

    useVisibleTask$(() => {
        // eslint-disable-next-line qwik/valid-lexical-scope
        slotCtx.header = <HeaderContent receipt={signal.value.receipt} shareURL={sharedUrl}/>;
    });

    return <Page receipt={receipt} shareURL={sharedUrl} sharedBy={signal.value.sharedBy}/>;
});


export const head: DocumentHead = ({ resolveValue }) => {
    const resolved = resolveValue(useRecipesDetails);

    return {
        title : resolved ? resolved.receipt.title : $localize `pages.shared.head_title`
    };
};
