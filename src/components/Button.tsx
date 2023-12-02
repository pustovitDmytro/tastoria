import { $, component$,
    Slot } from '@builder.io/qwik';
import type {
    Signal,
    NoSerialize,
    PropFunction,
    QwikMouseEvent
} from '@builder.io/qwik';
import styles from './Button.module.css';

type ButtonProps = {
  inline?: boolean;
  class?: string;
  onClick?: (event: QwikMouseEvent, element: HTMLButtonElement) => any
};


export default component$((props: ButtonProps) => {
    return (
        <button
            class={[
                styles.button,
                props.class,
                {
                    [styles.inline] : props.inline
                }
            ]}
            onClick$={props.onClick}
        >
            <Slot/>
        </button>
    );
});
