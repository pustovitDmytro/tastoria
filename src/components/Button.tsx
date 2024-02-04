import {
    $,
    component$,
    Slot,
    useSignal
} from '@builder.io/qwik';
import type {
    ClassList
} from '@builder.io/qwik';
import styles from './Button.module.css';
import Loader from './Loader';

type ButtonProps = {
  inline?: boolean;
  icon?:boolean;
  class?: ClassList | ClassList[];
  onClick: () => undefined | Promise<void>
};

export default component$((props: ButtonProps) => {
    const isLoading = useSignal(false);
    const isFailed = useSignal(false);
    const handleClick = $(async () => {
        try {
            isFailed.value = false;
            isLoading.value = true;
            // eslint-disable-next-line qwik/valid-lexical-scope
            await props.onClick();
            isLoading.value = false;
        } catch {
            isFailed.value = true;
            isLoading.value = false;
        }
    });

    return (
        <button
            class={[
                styles.button,
                props.class,
                {
                    [styles.inline]    : props.inline,
                    [styles.icon]      : props.icon,
                    [styles.isLoading] : isLoading.value,
                    [styles.error]     : isFailed.value
                }
            ]}
            onClick$={handleClick}
        >
            <Loader class={[ styles.loader, { [styles.isLoading]: isLoading.value } ]}/>
            <Slot/>
        </button>
    );
});
