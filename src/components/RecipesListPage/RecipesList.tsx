import { component$ } from '@builder.io/qwik';
import styles from './RecipesList.module.css';
import Card from './card';
import { Link } from '~/components/Link';
import type { Recipe } from '~/types';

interface ItemProps {
    data: Array<Recipe>;
}

export default component$<ItemProps>((props) => {
    return (
        <div class={styles.component}>
            {props.data.map((recepy) => (
                <Link href={`/recipes/${recepy.id}`} key={recepy.id}>
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
