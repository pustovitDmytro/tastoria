import { component$ } from '@builder.io/qwik';
import type {
    ClassList
} from '@builder.io/qwik';
import styles from './Loader.module.css';

type LoaderProps = {
  class?: ClassList | ClassList[];
};

export default component$((props: LoaderProps) => {
    return (
        <div class={[ props.class, styles.component ]}>
            <span class={styles.loader}></span>
        </div>
    );
});
