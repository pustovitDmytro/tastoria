import { $, component$, useSignal } from '@builder.io/qwik';
import type {
    Signal
} from '@builder.io/qwik';
import styles from './CheckBox.module.css';

type Props = {
  id: string;
  value: Signal<boolean>;
  label: string;
  class?: string;
};

export default component$((props: Props) => {
    const { value, label, id } = props;
    const count = useSignal(false);

    return (
        <div class={[ styles.container, props.class ]}>
            <input
                type='checkbox'
                id={id}
                name={id}
                bind:checked={value}
                class={styles.input}
            />
            <label for={id} class={styles.label}>{label}</label>
        </div>
    );
});
