import { component$ } from '@builder.io/qwik';
import styles from './card.module.css';
import Image from '~/components/Image/image';

interface ItemProps {
  title: string;
  image?:string;
  categories: Array<string>;
  tags: Array<string>;
}

const oneLine = 18;

export default component$<ItemProps>((props) => {
    const isOneLiner = props.title.length < oneLine;
    // const isTwoLiner = !isOneLiner && props.title.length < 2 * oneLine;
    const title = props.title.length <= 2 * oneLine
        ? props.title
        : `${props.title.slice(0, 2 * oneLine - 6)  }..`;

    return (
        <div class={[ styles.component, { [styles.bigTitle]: !isOneLiner } ]}>
            <Image src={props.image}/>
            <h3>{title}</h3>
            <div>

            </div>
        </div>

    );
});
