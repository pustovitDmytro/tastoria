import { component$ } from '@builder.io/qwik';
import styles from './RecipesList.module.css';
import Card from '~/components/RecipesCard/card';

export interface Receipt {
  title: string;
  image?:string;
  categories: Array<string>;
  tags: Array<string>;
}

interface ItemProps {
    data: Array<Receipt>;
}

export default component$<ItemProps>((props) => {
    return (
        <div class={styles.component}>
            {props.data.map((receipts) => (
                <Card
                    key={receipts.title}
                    title={receipts.title}
                    categories={receipts.categories}
                    tags={receipts.tags}
                    image={receipts.image}
                />
            ))}
        </div>
    );
});
