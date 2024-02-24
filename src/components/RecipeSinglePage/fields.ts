import { useSignal, type Signal } from '@builder.io/qwik';

export interface Field {
    type: 'text' | 'number' | 'multiline',
    key: string,
    label: string,
    linesToArray?: boolean,
    signal: Signal<string>
}

export const fields = [
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
];

export function addSignal(field, recipe):Field {
    return {
        ...field,
        // eslint-disable-next-line qwik/use-method-usage
        signal : useSignal(
            field.linesToArray
                ? recipe[field.key].join('\n')
                : recipe[field.key]
        )
    };
}

export function getFieldHash(fieldValues:Field[]):string {
    return fieldValues.map(f => f.signal.value).join('');
}
