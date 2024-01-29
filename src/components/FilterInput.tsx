import { $, component$, useSignal } from '@builder.io/qwik';
import type {
    Signal
} from '@builder.io/qwik';
import styles from './FilterInput.module.css';
import TextInput from './TextInput';
import CheckBox from './CheckBox';
import Button from './Button';

type FilterOption = {
    id: string,
    label: string,
    isSelected: Signal<boolean>
}

type Props = {
  search?: Signal<string>,
  options:FilterOption[];
  class?:string;
};


export default component$((props: Props) => {
    const { search, options } = props;
    const needOpen = useSignal(false);

    return (
        <div class={[ styles.container, props.class ]}>
            <TextInput
                value={search}
                label='Search'
                type='search'
                onFocus={$((e, o) => {
                    needOpen.value = true;
                })}
            />
            {
                needOpen.value && <div class={styles.options}>
                    <Button
                        class={styles.closeButton}
                        onClick={$(() => needOpen.value = false)}
                    >
                        <i class={[ styles.arrow, styles.up ]}/>
                    </Button>
                {
                    ...options.map(o => <CheckBox
                        key={o.id}
                        id={o.id}
                        label={o.label}
                        value={o.isSelected}
                        class={styles.option}
                    />)
                }
                </div>
            }

        </div>
    );
});
