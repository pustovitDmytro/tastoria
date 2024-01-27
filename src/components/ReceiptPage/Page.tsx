/* eslint-disable qwik/valid-lexical-scope */
import { $, Resource, component$, useContext, useResource$, useStore, useTask$ } from '@builder.io/qwik';
import QRCode from 'qrcode';
import styles from './recipy.module.css';
import type { Receipt } from '~/types';
import Image from '~/components/Image/image';
import FavoriteIcon from '~/components/Icons/favorite.svg';
import RatingIcon from '~/components/Icons/rating.svg';
import Button from '~/components/Button';
import { recipesContext } from '~/stores';

interface SourceProps {
    url?: string;
}

const Source = component$<SourceProps>((props) => {
    if (!props.url) return null;
    const url = new URL(props.url);

    return <div class={styles.contentItem}>
        <span class={styles.propertyLabel}>{$localize `component.ReciptPage_Page.sourceLabel`}</span>
        <a class={styles.source} href={url.href}>{url.host}</a>
    </div>;
});

function getRecipyHash(r: Receipt):string {
    return JSON.stringify({
        rating : r.rating
    });
}

interface Props {
    receipt: Receipt;
    shareURL: URL;
    sharedBy?: string;
}

export default component$<Props>((props) => {
    const { shareURL, sharedBy } = props;
    const receipt = useStore(props.receipt);
    const readOnly = !!sharedBy;

    const recipyContext = useContext(recipesContext);
    const contextIndex = recipyContext.list.value.findIndex(r => r.id === receipt.id);

    const contextHash = ~contextIndex && getRecipyHash(recipyContext.list.value[contextIndex]);

    const qrCode = useResource$<string>(async () => {
        return QRCode.toString(shareURL.href, { type: 'svg' });
    });

    useTask$(async ({ track }) => {
        const changed = track(() => getRecipyHash(receipt));

        if (!readOnly && changed !== contextHash) {
            receipt.updatedAt = (new Date()).toISOString();
            recipyContext.list.value.splice(contextIndex, 1, receipt);
            recipyContext.list.value = [ ...recipyContext.list.value ];
        }
    });


    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <Image class={styles.image} src={receipt.image} userId={sharedBy}/>
                <div class={styles.content}>
                    <h1>{receipt.title}</h1>
                    <div class={styles.contentItem}>
                        {receipt.description}
                    </div>
                    <div class={[ styles.contentItem, styles.ratingIcons ]}>
                        {
                            Array.from({ length: 5 }).map(
                                (e, i) => <Button
                                    icon={true}
                                    class={[
                                        styles.ratingIcon,
                                        { [styles.filled]: receipt.rating && receipt.rating >= i + 1 }
                                    ]}
                                    key={i}
                                    onClick={$(() => {
                                        receipt.rating = i + 1;
                                    })}
                                >
                                    <RatingIcon/>
                                </Button>
                            )
                        }
                    </div>
                    <div class={styles.contentItem}>
                        <span class={styles.propertyLabel}>{$localize `component.ReciptPage_Page.quantityLabel`}</span>
                        {receipt.quantity}
                    </div>
                    <Source url={receipt.url}/>
                </div>
            </div >
            <h2>{$localize `component.ReciptPage_Page.ingredientsLabel`}</h2>
            <ul class={styles.ingredients}>
                {
                    receipt.ingredients.map(ing => <li key={ing}>
                        {ing}
                    </li>)
                }
            </ul>
            <Resource
                value={qrCode}
                onRejected={() => <div class={styles.qrCode}/>}
                onResolved={svg => <div class={styles.qrCode} dangerouslySetInnerHTML={svg}/>}
            />
            <h2>{$localize `component.ReciptPage_Page.stepsLabel`}</h2>
            <ol class={styles.steps}>
                {
                    receipt.steps.map(step => <li key={step}>
                        {step}
                    </li>)
                }
            </ol>
        </div>
    );
});

