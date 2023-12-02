import { $,
    component$,
    noSerialize } from '@builder.io/qwik';
import type {
    Signal,
    NoSerialize,
    PropFunction
} from '@builder.io/qwik';
import styles from './FileInput.module.css';

  type FileInputProps = {
    value: Signal<NoSerialize<Blob>[] | NoSerialize<File>[] | undefined>;
    label: string;
    class: string;
  };


export default component$((props: FileInputProps) => {
    const { value, label } = props;

    const onChange = $((e, o) => {
        const file = o.files?.[0];

        if (file) {
            value.value = noSerialize(file);
        }
    });

    return (
        <div class={[ styles.container, props.class ]}>
            <label>{label}</label>
            <input
                class={styles.input}
                onChange$={onChange}
                type='file'
            />
        </div>
    );
});
