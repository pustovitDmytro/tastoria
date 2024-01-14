import { $, component$, useSignal } from '@builder.io/qwik';
import type {
    Signal
} from '@builder.io/qwik';
import styles from './Select.module.css';

type Props = {
  value: Signal<string>;
  options: Array<{id: string, label: string}>;
  class?: string;
};

export default component$((props: Props) => {
    const { value, options } = props;
    const count = useSignal(false);

    return (
        <div class={[ styles.container, props.class ]}>
            <select bind:value={value}>
                {options.map(o =>
                    <option
                        key={o.id}
                        value={o.id}
                        selected={o.id === value.value}
                    >
                        {o.label}
                    </option>)}
            </select>
        </div>
    );
});
