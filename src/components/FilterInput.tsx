import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
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
    const ref = useSignal<Element>();

    const hideOnClickOutside = $((element) => {
        const outsideClickListener = event => {
            if (!element.contains(event.target)) {
                needOpen.value = false;
                removeClickListener();
            }
        };

        const removeClickListener = () => {
            document.removeEventListener('click', outsideClickListener);
        };

        document.addEventListener('click', outsideClickListener);
    });

    useVisibleTask$(({ track }) => {
        const isOpen = track(() => needOpen.value);

        if (isOpen) {
            const elem = ref.value;

            hideOnClickOutside(elem);
        }
    });

    return (
        <div ref={ref} class={[ styles.container, props.class ]}>
            <TextInput
                value={search}
                label={$localize `component.FilterInput.searchLabel` }
                type='search'
                onFocus={$((e, o) => {
                    needOpen.value = true;
                })}
            />
            {
                (options.length > 0  && needOpen.value) && <div
                    class={styles.options}
                    onClick$={event => event.stopPropagation()}
                >
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
