import { component$ } from '@builder.io/qwik';
import type {
    Signal
} from '@builder.io/qwik';
import styles from './Progress.module.scss';

type Props = {
  value: Signal<number>;
  class?: string;
};

export default component$((props: Props) => {
    const { value } = props;

    return (
        <div class={[ styles.container, props.class ]}>
            <div
                class={styles.indicator}
                style={{
                    transform : `translateX(-${100 - 100 * value.value}%)`
                }}
            />
        </div>
    );
});
