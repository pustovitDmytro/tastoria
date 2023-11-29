import { component$, useContext  } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { version, license } from '../../../package.json';
import styles from './styles.module.css';
import Image from '~/media/about.png?jsx';

export default component$(() => {
    return (
        <>
            <div class={styles.page}>
                <div class={styles.paper}>
                    <div class={styles.header}>Tastoria</div>
                    <div class={styles.content}>License: {license}</div>
                    <div class={styles.footer}>v.{version}</div>
                </div>
                <Image class={styles.image}/>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : 'About Tastoria',
    meta  : [
        {
            name    : 'about',
            content : 'About page'
        }
    ]
};

