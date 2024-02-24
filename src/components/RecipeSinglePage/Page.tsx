/* eslint-disable qwik/valid-lexical-scope */
import { $, Resource, component$, useContext, useResource$, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import QRCode from 'qrcode';
import styles from './recipe.module.css';
import type { Recipe } from '~/types';
import Image from '~/components/Image/image';
import FavoriteIcon from '~/components/Icons/favorite.svg';
import PopularityIcon from '~/components/Icons/popularity.svg';
import RatingIcon from '~/components/Icons/rating.svg';
import Button from '~/components/Button';
import { recipesContext } from '~/stores';

interface SourceProps {
    url?: string;
}

const Source = component$<SourceProps>((props) => {
    if (!props.url) return null;
    const url = new URL(props.url);

    return <div class={styles.contentItem}>
        <span class={styles.propertyLabel}>{$localize `component.RecipePage_ViewPage.sourceLabel`}:</span>
        <a class={styles.source} href={url.href}>{url.host}</a>
    </div>;
});

function getRecipeHash(r: Recipe):string {
    return JSON.stringify({
        rating   : r.rating,
        favorite : r.favorite,
        visits   : r.visits
    });
}

interface Props {
    recipe: Recipe;
    shareURL: URL;
    sharedBy?: string;
}

const MAX_RATING = 5;
const IS_VISITED_TIMEOUT = 60 * 1000;

// eslint-disable-next-line max-lines-per-function
export default component$<Props>((props) => {
    const { shareURL, sharedBy, recipe } = props;
    const recipesCtx = useContext(recipesContext);
    const recipeCtx = recipesCtx.all[recipe.id];

    const qrCode = useResource$<string>(async () => {
        return QRCode.toString(shareURL.href, { type: 'svg' });
    });

    useVisibleTask$(({ cleanup }) => {
        if (!sharedBy) {
            const visitsTimeout = setTimeout(() => {
                recipe.visits++;
            }, IS_VISITED_TIMEOUT);

            cleanup(() => clearTimeout(visitsTimeout));
        }
    });

    useTask$(async ({ track }) => {
        track(() => getRecipeHash(recipe));

        if (!sharedBy) {
            recipe.updatedAt = (new Date()).toISOString();
            recipesCtx.lastChanged.value = new Date();
        }
    });


    return (
        <div class={styles.component}>
            <div class={styles.preview}>
                <Image class={styles.image} src={recipe.image} userId={sharedBy}/>
                <div class={styles.content}>
                    <h1>{recipe.title}</h1>
                    <div class={styles.contentItem}>
                        {recipe.description}
                    </div>
                    <div class={[ styles.contentItem ]}>
                        {
                            Array.from({ length: MAX_RATING }).map(
                                (e, i) => <Button
                                    icon={true}
                                    class={[
                                        styles.ratingIcon,
                                        { [styles.filled]: recipe.rating && recipe.rating >= i + 1 }
                                    ]}
                                    key={i}
                                    onClick={$(() => recipe.rating = i + 1)}
                                >
                                    <RatingIcon/>
                                </Button>
                            )
                        }
                    </div>
                    <div class={styles.contentItem}>
                        <span class={styles.propertyLabel}>{$localize `component.RecipePage_ViewPage.quantityLabel`}:</span>
                        {recipe.quantity}
                        <Source url={recipe.url}/>
                    </div>
                    <div class={styles.contentItem}>
                        {
                            !sharedBy && <div class={[ styles.contentItem, styles.popularity ]}>
                                <div class={styles.visitsStatistics}>
                                    <PopularityIcon/>
                                    <span class={styles.visitsValue}>
                                        {recipe.visits}
                                    </span>
                                </div>
                                <Button
                                    icon={true}
                                    class={[
                                        styles.favoriteIcon,
                                        { [styles.filled]: recipe.favorite }
                                    ]}
                                    onClick={$(() => recipe.favorite = !recipe.favorite)}
                                >
                                    <FavoriteIcon/>
                                </Button>
                            </div>
                        }
                    </div>
                </div>
            </div >
            <h2>{$localize `component.RecipePage_ViewPage.ingredientsLabel`}:</h2>
            <ul class={styles.ingredients}>
                {
                    recipe.ingredients.map(ing => <li key={ing}>
                        {ing}
                    </li>)
                }
            </ul>
            <Resource
                value={qrCode}
                onRejected={() => <div class={styles.qrCode}/>}
                onResolved={svg => <div class={styles.qrCode} dangerouslySetInnerHTML={svg}/>}
            />
            <h2>{$localize `component.RecipePage_ViewPage.stepsLabel`}:</h2>
            <ol class={styles.steps}>
                {
                    recipe.steps.map(step => <li key={step}>
                        {step}
                    </li>)
                }
            </ol>
        </div>
    );
});

