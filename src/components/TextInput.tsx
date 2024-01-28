import { component$ } from '@builder.io/qwik';
import type {
    Signal,
    PropFunction
} from '@builder.io/qwik';
import styles from './TextInput.module.css';

type InputProps = {
  value?:Signal<string>;
  label: string;
  class?: string;
  type: 'button'| 'checkbox'| 'color'| 'date'| 'email'| 'file'| 'hidden'| 'image'| 'month'| 'number'| 'password'| 'radio'| 'range'| 'reset'| 'search'| 'submit'| 'tel'| 'text'| 'time'| 'url'| 'week' | 'multiline';
  onFocus?:PropFunction<any>
  onBlur?:PropFunction<any>
};

/* eslint-disable qwik/valid-lexical-scope*/
export default component$((props: InputProps) => {
    const { value, label, type, onFocus, onBlur } = props;

    return (
        <div class={[ styles.container, props.class ]}>
            {
                type === 'multiline'
                    ? <textarea
                        bind:value={value}
                        class={styles.input}
                        placeholder={label}
                        onFocus$={onFocus}
                        onBlur$={onBlur}
                    />
                    : <input
                        bind:value={value}
                        class={styles.input}
                        type={type}
                        placeholder={label}
                        onFocus$={onFocus}
                        onBlur$={onBlur}
                    />
            }
        </div>
    );
});
