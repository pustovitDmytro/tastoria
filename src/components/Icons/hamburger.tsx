import { component$ } from '@builder.io/qwik';
import styles from './hamburger.module.css';

type Props = {
    isOpened: boolean;
    class?: string;
};

export default component$<Props>((props) => {
    return (
        <button
            class={[
                props.class,
                styles.container,
                { [styles.active]: props.isOpened }
            ]}>
            <span></span>
            <span></span>
            <span></span>
        </button>
    );
});

