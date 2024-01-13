import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import styles from './recipy.module.css';
import type { Receipt } from '~/types';
import firebase from '~/firebase';
import Image from '~/components/Image/image';

export const useRecipesDetails = routeLoader$(async ({ cookie, params }) => {
    const session = cookie.get('tastoria.session');
    const user = session?.json() as any;

    if (!user) return null;
    const recipyId = params.id;

    return firebase.downloadRecipy(user.id, recipyId);
});


interface SourceProps {
    url?: string;
}

const Source = component$<SourceProps>((props) => {
    if (!props.url) return null;
    const url = new URL(props.url);

    return <div>Source: <a class={styles.source} href={url.href}>{url.host}</a></div>;
});

export default component$(() => {
    const signal = useRecipesDetails();

    if (!signal.value) return <div>Not Found</div>;

    return (
        <>
            <div class={styles.component}>
                <div class={styles.preview}>
                    <Image src={signal.value.image}/>
                    <div class={styles.content}>
                        <h1>{signal.value.title}</h1>
                        <div>{signal.value.description}</div>
                        <div>Quantity: {signal.value.quantity}</div>
                        <Source url={signal.value.url}/>
                    </div>
                </div >
                Ingredients:
                <ul class={styles.ingredients}>
                    {
                        signal.value.ingredients.map(ing => <li>{ing}</li>)
                    }
                </ul>
                Steps:
                <ol class={styles.steps}>
                    {
                        signal.value.steps.map(step => <li>{step}</li>)
                    }
                </ol>
            </div>
        </>
    );
});

export const head: DocumentHead = ({ resolveValue }) => {
    const recipy = resolveValue(useRecipesDetails);

    return {
        title : recipy ? recipy.title : 'Tastoria Receipt'
    };
};
