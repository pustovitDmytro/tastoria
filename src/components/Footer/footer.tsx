import { component$ } from '@builder.io/qwik';
import styles from './footer.module.css';

type Props = {
    class?: string;
};

export default component$<Props>((props) => {
    return (
        <footer
            class={[
                props.class,
                styles.container
            ]}>
        </footer>
    );
});
