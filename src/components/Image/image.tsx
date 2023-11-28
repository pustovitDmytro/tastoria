import { component$, useSignal, useVisibleTask$,
    useResource$,
    Resource } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import styles from './image.module.css';
import Image from '~/media/placeholder.png?jsx';
import firebase from '~/firebase';

interface ItemProps {
    src?:string;
}

export const placeholder = <Image class={styles.placeholder}/>;
export const loader = <div class={styles.component}>
    <span class={styles.loader}></span>
</div>;


export default component$<ItemProps>((props) => {
    if (!props.src) return placeholder;

    const url = useResource$<string>(
        async () => {
            if (isServer) {
                return firebase.getImageUrl(props.src);
            }

            const blob = await firebase.downloadImage(props.src);

            return URL.createObjectURL(blob);
        }
    );

    return <Resource
        value={url}
        onPending={() => loader}
        onRejected={() => loader}
        onResolved={u => <img src={u} class={styles.image} crossOrigin='anonymous'/>}
    />;
});
