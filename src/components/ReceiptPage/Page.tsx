/* eslint-disable qwik/valid-lexical-scope */
import { $, component$, useContext, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import styles from './recipy.module.css';
import type { Receipt } from '~/types';
import Image from '~/components/Image/image';

interface SourceProps {
    url?: string;
}

const Source = component$<SourceProps>((props) => {
    if (!props.url) return null;
    const url = new URL(props.url);

    return <div class={styles.contentItem}>
        <span class={styles.propertyLabel}>Source:</span>
        <a class={styles.source} href={url.href}>{url.host}</a>
    </div>;
});

interface Props {
    receipt: Receipt;
    shareURL: URL
}

export default component$<Props>((props) => {
    const { receipt, shareURL } = props;

    console.log('sharedUrl:', shareURL.href);

    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <Image src={receipt.image}/>
                <div class={styles.content}>
                    <h1>{receipt.title}</h1>
                    <div class={styles.contentItem}>
                        {receipt.description}
                    </div>
                    <div class={styles.contentItem}>
                        <span class={styles.propertyLabel} >Quantity:</span>
                        {receipt.quantity}
                    </div>
                    <Source url={receipt.url}/>
                </div>
            </div >
            <h2>Ingredients:</h2>
            <ul class={styles.ingredients}>
                {
                    receipt.ingredients.map(ing => <li key={ing}>
                        {ing}
                    </li>)
                }
            </ul>
            <h2>Steps:</h2>
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

