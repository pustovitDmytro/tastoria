/* eslint-disable qwik/valid-lexical-scope */
import { component$ } from '@builder.io/qwik';
import TextInput from '../TextInput';
import styles from './EditPage.module.css';
import type { Field } from './fields';
import type { Recipe } from '~/types';

interface Props {
    recipe?: Recipe;
    fields: Field[]
}

// eslint-disable-next-line max-lines-per-function
export default component$<Props>((props) => {
    const { fields, recipe } = props;
    const isCreate = !recipe;

    const title = isCreate
        ? $localize `component.RecipePage_EditPage.create_title`
        : $localize `component.RecipePage_EditPage.title`;

    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <div class={styles.content}>
                    <h1>{title}</h1>
                    {...fields.map(f => <div class={styles.item} key={f.key}>
                        <span class={styles.itemLabel}>{f.label}</span>
                        <TextInput type={f.type} value={f.signal} label={f.label} class={styles.input}/>
                    </div>)}
                </div>
            </div >
        </div>
    );
});

