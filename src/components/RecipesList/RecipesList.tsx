import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import styles from './RecipesList.module.css';
import Card from '~/components/RecipesCard/card';

export interface Receipt {
  id: string;
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
            {props.data.map((recepy) => (
                <Link prefetch href={`/recipes/${recepy.id}`} key={recepy.id}>
                    <Card
                        title={recepy.title}
                        categories={recepy.categories}
                        tags={recepy.tags}
                        image={recepy.image}
                    />
                </Link>
            ))}
        </div>
    );
});
