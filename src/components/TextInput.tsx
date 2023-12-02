import { $, component$ } from '@builder.io/qwik';
import type {
    Signal,
    NoSerialize,
    PropFunction
} from '@builder.io/qwik';
import styles from './TextInput.module.css';

type InputProps = {
  value?:string;
//   value: Signal<string | undefined>;
  label: string;
  class?: string;
  type: string;
};


export default component$((props: InputProps) => {
    const { value, label, type } = props;

    return (
        <div class={[ styles.container, props.class ]}>
            <input
                value={value}
                class={styles.input}
                type={type}
                placeholder={label}
            />
        </div>
    );
});
