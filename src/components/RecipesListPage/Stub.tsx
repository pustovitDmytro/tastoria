import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import Page from '../Page';
import Header from '../Header/header';
import styles from './Stub.module.css';
import RecipeIcon from '~/components/Icons/recipe.svg?component';
import ImportIcon from '~/components/Icons/import.svg?component';
import AddIcon from '~/components/Icons/add.svg?component';

interface ItemProps {
  isFiltered: boolean;
}

export default component$<ItemProps>((props) => {
    const title = props.isFiltered
        ? $localize `component.RecipesPage_Stub.filteredTitle`
        : $localize `component.RecipesPage_Stub.title`;

    const subtitle = props.isFiltered
        ? $localize `component.RecipesPage_Stub.filteredSubtitle`
        : $localize `component.RecipesPage_Stub.subtitle`;

    return <Page>
        <Header
            actions={[]}
            q:slot='header'
        />
        <div q:slot='content' class={[ styles.component ]}>
            <h1>{title}</h1>
            <h2>{subtitle}</h2>
            <RecipeIcon class={styles.icon}/>
            {
                !props.isFiltered && <div class={styles.actions}>
                    <Link class={styles.link} href={'/recipes/create'}>
                        <AddIcon/>
                        <span>{$localize `component.RecipesPage_Stub.create_recipe_text`}</span>
                    </Link>
                    <Link class={styles.link} href={'/import'}>
                        <ImportIcon/>
                        <span>{$localize `component.RecipesPage_Stub.import_text`}</span>
                    </Link>
                </div>}
        </div>
    </Page>;
});
