/* eslint-disable sonarjs/no-nested-template-literals */
import { $, component$, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import type { ActionStore } from '@builder.io/qwik-city';
import { getFieldHash, type Field } from './fields';
import type { Recipe } from '~/types';
import { recipesContext } from '~/stores';
import Header from '~/components/Header/header';

const version = TASTORIA_BUILD.VERSION;

interface HeaderProps {
    recipe: Recipe;
    onSave: ActionStore<never, Record<string, unknown>, true>,
    fields: Field[]
}

// eslint-disable-next-line max-lines-per-function
export default component$<HeaderProps>((props) => {
    const { recipe, onSave, fields } = props;
    const isNotChanged = useSignal(true);
    const recipeContext = useContext(recipesContext);
    const initialHash = getFieldHash(fields);

    const saveBtn = {
        disabled : isNotChanged,
        visible  : useSignal(true),
        handler  : $(async () => {
            const edited = {
                ...recipe,
                version,
                deletedAt : undefined,
                updatedAt : (new Date()).toISOString()
            };

            fields.forEach(f => {
                if (f.linesToArray) {
                    return edited[f.key] = f.signal.value.split('\n');
                }

                if (f.type === 'chips') {
                    return edited[f.key] = [ ...f.store ];
                }

                edited[f.key] = f.signal.value;
            });

            recipeContext.all[edited.id] = edited;

            await onSave.submit(edited);
        }),
        icon         : 'save',
        caption      : $localize `component.RecipePage_EditPage.save_btn`,
        successToast : $localize `component.RecipePage_EditPage.save_successToast`
    };

    useTask$(({ track }) => {
        const changed = track(() => getFieldHash(fields));

        isNotChanged.value = initialHash === changed;
    });

    return <Header
        actions={[ saveBtn ]}
    />;
});

