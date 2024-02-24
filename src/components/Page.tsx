import { Slot, component$ } from '@builder.io/qwik';
import styles from './Page.module.css';

export default component$((props) => {
    return <main class={styles.page}>
        <div class={styles.header}>
            <Slot name='header'></Slot>
        </div>
        <div class={styles.content}>
            <Slot name='content'></Slot>
        </div>
    </main>;
});
