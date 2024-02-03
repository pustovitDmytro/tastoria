/* eslint-disable qwik/valid-lexical-scope */
import { $, Resource, component$, useContext, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { ActionStore } from '@builder.io/qwik-city';
import { v4 as uuid } from 'uuid';
import { version } from '../../../package.json';
import TextInput from '../TextInput';
import styles from './EditPage.module.css';
import type { Recipe } from '~/types';
import Button from '~/components/Button';
import { recipesContext } from '~/stores';

interface Props {
    recipe?: Recipe;
    onSave: ActionStore<never, Record<string, unknown>, true>
}

interface FieldConfig {
    type: 'text' | 'number' | 'multiline',
    key: string,
    label: string,
    linesToArray?: boolean
}

const fields = [
    { key: 'title', label: $localize `component.RecipePage_EditPage.titleLabel`, type: 'text' },
    { key: 'description', label: $localize `component.RecipePage_EditPage.descriptionLabel`, type: 'multiline' },
    { key: 'url', label: $localize `component.RecipePage_EditPage.urlLabel`, type: 'text' },
    // { key: 'language', label: $localize `component.RecipePage_EditPage.languageLabel`, type: 'input' },
    { key: 'quantity', label: $localize `component.RecipePage_EditPage.quantityLabel`, type: 'number' },
    { key: 'comment', label: $localize `component.RecipePage_EditPage.commentLabel`, type: 'multiline' },
    { key: 'ingredients', label: $localize `component.RecipePage_EditPage.ingredientsLabel`, type: 'multiline', linesToArray: true },
    { key: 'steps', label: $localize `component.RecipePage_EditPage.stepsLabel`, type: 'multiline', linesToArray: true },
    // { key: 'time', label: $localize `component.RecipePage_EditPage.timeLabel`, type: 'input' },
    { key: 'rating', label: $localize `component.RecipePage_EditPage.ratingLabel`, type: 'number' }
] as FieldConfig[];

function getRecipePlaceHolder():Recipe {
    return {
        id          : uuid(),
        title       : '',
        description : '',
        categories  : [],
        tags        : [],
        language    : 'en',
        quantity    : '',
        comment     : '',
        ingredients : [],
        steps       : [],
        time        : {
            total   : '',
            prepare : '',
            cook    : ''
        },
        version,
        favorite : false,
        visits   : 0,
        rating   : 0,

        updatedAt : (new Date()).toISOString(),
        createdAt : (new Date()).toISOString()
    };
}


// eslint-disable-next-line max-lines-per-function
export default component$<Props>((props) => {
    const { onSave } = props;
    const isCreate = !props.recipe;
    const recipe = props.recipe || getRecipePlaceHolder();
    const fieldSignals = fields.map(f => ({
        ...f,
        // eslint-disable-next-line qwik/use-method-usage
        signal : useSignal(
            f.linesToArray
                ? recipe[f.key].join('\n')
                : recipe[f.key]
        )
    }));

    const recipeContext = useContext(recipesContext);

    const handleSave = $(async () => {
        const edited = {
            ...recipe,
            version,
            deletedAt : undefined,
            updatedAt : (new Date()).toISOString()
        };

        fieldSignals.forEach(f => {
            edited[f.key] = f.linesToArray
                ? f.signal.value.split('\n')
                : f.signal.value;
        });

        recipeContext.all[edited.id] = edited;

        await onSave.submit(edited);
    });

    useVisibleTask$(() => {
        if (!isCreate) {
            document.title = `* ${recipe.title}`;
        }
    });

    const title = isCreate
        ? $localize `component.RecipePage_EditPage.create_title`
        : $localize `component.RecipePage_EditPage.title`;

    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <div class={styles.content}>
                    <h1>{title}</h1>
                    {...fieldSignals.map(f => <div class={styles.item} key={f.key}>
                        <span class={styles.itemLabel}>{f.label}</span>
                        <TextInput type={f.type} value={f.signal} label={f.label} class={styles.input}/>
                    </div>)}
                </div>
            </div >
            <div class={styles.footer}>
                <Button class={styles.saveButton} onClick={handleSave}>{$localize `component.RecipePage_EditPage.save_btn`}</Button>
            </div>
        </div>
    );
});

