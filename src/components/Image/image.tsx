import { component$, useContext,
    useResource$,
    Resource } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import styles from './image.module.css';
import Image from '~/media/placeholder.png?jsx';
import firebase from '~/firebase';
import { sessionContext } from '~/stores';
import Loader from '~/components/Loader.js';

interface ItemProps {
    src?:string;
    userId?: string;
}

export const placeholder = <Image class={styles.placeholder}/>;

export default component$<ItemProps>((props) => {
    if (!props.src) return placeholder;
    const session = useContext(sessionContext);

    const url = useResource$<string>(
        async () => {
            const userId = props.userId || session.user.value.id;

            if (isServer) {
                return firebase.getImageUrl(userId, props.src);
            }

            const blob = await firebase.downloadImage(userId, props.src);

            return URL.createObjectURL(blob);
        }
    );

    return <Resource
        value={url}
        onPending={() => <Loader class={styles.loader}/>}
        onRejected={() => placeholder}
        onResolved={u => <img src={u} class={styles.image} crossOrigin='anonymous'/>}
    />;
});
