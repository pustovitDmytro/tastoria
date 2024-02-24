import { component$ } from '@builder.io/qwik';
import Page from '../Page';
import Header from '../Header/header';
import styles from './Stub.module.css';
import RecipeIcon from '~/components/Icons/recipe.svg?component';

interface ItemProps {
    title: string
    subtitle?:string
}

export default component$<ItemProps>((props) => {
    const { title, subtitle } = props;

    return <Page>
        <Header
            actions={[]}
            q:slot='header'
        />
        <div q:slot='content' class={[ styles.component ]}>
            <h1>{title}</h1>
            {subtitle ? <h2>{subtitle}</h2> : null}
            <RecipeIcon class={styles.icon}/>
        </div>
    </Page>;
});
