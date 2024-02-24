import {
    $,
    component$,
    Slot,
    useSignal
} from '@builder.io/qwik';
import type {
    ClassList
} from '@builder.io/qwik';
import logger from '../logger';
import styles from './Button.module.css';
import Loader from './Loader';

type ButtonProps = {
  inline?: boolean;
  icon?:boolean;
  disabled?:boolean;
  class?: ClassList | ClassList[];
  onClick: () => any
};

export default component$((props: ButtonProps) => {
    const { disabled } = props;
    const isLoading = useSignal(false);
    const isFailed = useSignal(false);
    const handleClick = $(async () => {
        if (disabled) return;
        try {
            isFailed.value = false;
            isLoading.value = true;
            // eslint-disable-next-line qwik/valid-lexical-scope
            await props.onClick();
            isLoading.value = false;
        } catch (error) {
            isFailed.value = true;
            isLoading.value = false;
            logger.error(error);
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
                    [styles.error]     : isFailed.value,
                    [styles.disabled]  : props.disabled
                }
            ]}
            onClick$={handleClick}
        >
            <Loader class={[ styles.loader, { [styles.isLoading]: isLoading.value } ]}/>
            <Slot/>
        </button>
    );
});
