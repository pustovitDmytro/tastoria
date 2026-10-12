import { component$, useContext,
    useResource$,
    Resource } from '@builder.io/qwik';
import { isServer } from '@builder.io/qwik/build';
import styles from './image.module.css';
import Image from '~/media/placeholder.png?jsx';
import entityStorage from '~/entityStorage/ui';
import { sessionContext } from '~/stores';
import Loader from '~/components/Loader.js';

interface ItemProps {
    src?:string;
    userId?: string;
    shareToken?: string;
    class?:string
}

export const placeholder = <Image class={styles.placeholder}/>;

export default component$<ItemProps>((props) => {
    if (!props.src) return placeholder;
    const src = props.src;
    const session = useContext(sessionContext);

    const url = useResource$<string>(
        async () => {
            const userId = props.userId || session.user.value.id;
            const ctx = { shareToken: props.shareToken };

            if (isServer) {
                return entityStorage.getImageUrl(userId, src, ctx);
            }

            const blob = await entityStorage.downloadImage(userId, src, ctx);

            return URL.createObjectURL(blob);
        }
    );

    return <Resource
        value={url}
        onPending={() => <Loader class={styles.loader}/>}
        onRejected={() => placeholder}
        onResolved={u => <img src={u} class={[ styles.image, props.class ]} crossOrigin='anonymous'/>}
    />;
});
