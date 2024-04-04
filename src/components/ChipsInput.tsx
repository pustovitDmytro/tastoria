import { $, component$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import styles from './ChipsInput.module.css';
import TextInput from './TextInput';
import Button from './Button';
import Icon from './Icons/Icon';

type Props = {
  value: Array<string>,
  label: string,
  options:string[];
  class?:string;
};

export default component$((props: Props) => {
    const { value, options, label } = props;

    const input = useSignal('');
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
            {
                ...value.map((s, i) => <div
                    key={i}
                    class={styles.chip}
                >
                    {s}
                    <Button
                        icon={true}
                        class={styles.dropChipButton}
                        onClick={$(() => {
                            value.splice(i, 1);
                        })}
                    >
                        <Icon name='closeMin'></Icon>
                    </Button>
                </div>)
            }
            <TextInput
                class={styles.input}
                value={input}
                label={label}
                type='search'
                onFocus={$((e, o) => {
                    needOpen.value = true;
                })}
            />
            {
                ((options.length > 0 || input.value.length > 0)  && needOpen.value) && <div
                    class={styles.options}
                    onClick$={event => event.stopPropagation()}
                >
                    {
                        [ ...options, input.value ]
                            .filter(Boolean)
                            .map((option, i) => <span
                                key={i}
                                class={styles.option}
                                onClick$={$(() => value.push(option))}
                            >
                                {option}
                            </span>)
                    }
                </div>
            }

        </div>
    );
});
