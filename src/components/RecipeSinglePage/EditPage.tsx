/* eslint-disable qwik/valid-lexical-scope */
import { component$, useContext } from '@builder.io/qwik';
import TextInput from '../TextInput';
import ChipsInput from '../ChipsInput';
import styles from './EditPage.module.css';
import type { Field } from './fields';
import type { Recipe } from '~/types';
import { recipesContext } from '~/stores';

interface Props {
    recipe?: Recipe;
    fields: Field[]
}

const filedInput = (field, recipeContext) => {
    if (field.type === 'chips') return <ChipsInput value={field.store} label={field.label} class={styles.input} options={recipeContext[field.options].map(r => r.value)}/>;

    return <TextInput type={field.type} value={field.signal} label={field.label} class={styles.input}/>;
};

// eslint-disable-next-line max-lines-per-function
export default component$<Props>((props) => {
    const { fields, recipe } = props;
    const isCreate = !recipe;

    const recipeContext = useContext(recipesContext);

    const title = isCreate
        ? $localize `component.RecipePage_EditPage.create_title`
        : $localize `component.RecipePage_EditPage.title`;

    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <div class={styles.content}>
                    <h1>{title}</h1>
                    {...fields.map(
                        f => <div class={styles.item} key={f.key}>
                            <span class={styles.itemLabel}>{f.label}</span>
                            {filedInput(f, recipeContext)}
                        </div>
                    )}
                </div>
            </div >
        </div>
    );
});

