/* eslint-disable qwik/use-method-usage */
import { useSignal, type Signal, useStore } from '@builder.io/qwik';

export interface Field {
    type: 'chips' | 'text' | 'number' | 'multiline',
    key: string,
    label: string,
    linesToArray?: boolean,
    signal: Signal<string>,
    store: Array<string>
}

export const fields = [
    { key: 'title', label: $localize `component.RecipePage_EditPage.titleLabel`, type: 'text' },
    { key: 'description', label: $localize `component.RecipePage_EditPage.descriptionLabel`, type: 'multiline' },
    { key: 'categories', label: $localize `component.RecipePage_EditPage.categoriesLabel`, type: 'chips', options: 'categories' },
    { key: 'tags', label: $localize `component.RecipePage_EditPage.tagsLabel`, type: 'chips', options: 'tags' },
    { key: 'url', label: $localize `component.RecipePage_EditPage.urlLabel`, type: 'text' },
    // { key: 'language', label: $localize `component.RecipePage_EditPage.languageLabel`, type: 'input' },
    { key: 'quantity', label: $localize `component.RecipePage_EditPage.quantityLabel`, type: 'number' },
    { key: 'comment', label: $localize `component.RecipePage_EditPage.commentLabel`, type: 'multiline' },
    { key: 'ingredients', label: $localize `component.RecipePage_EditPage.ingredientsLabel`, type: 'multiline', linesToArray: true },
    { key: 'steps', label: $localize `component.RecipePage_EditPage.stepsLabel`, type: 'multiline', linesToArray: true },
    // { key: 'time', label: $localize `component.RecipePage_EditPage.timeLabel`, type: 'input' },
    { key: 'rating', label: $localize `component.RecipePage_EditPage.ratingLabel`, type: 'number' }
];

export function addSignal(field, recipe):Field {
    let signal;
    let store;

    if (field.linesToArray) signal = useSignal(recipe[field.key].join('\n'));
    if (field.type === 'chips') store = useStore([ ...recipe[field.key] ]);
    if (!signal) signal = useSignal(recipe[field.key]);

    return {
        ...field,
        signal,
        store
    };
}

export function getFieldHash(fieldValues:Field[]):string {
    return fieldValues.map(f => f.signal.value).join('');
}
