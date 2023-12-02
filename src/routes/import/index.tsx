import { component$, useStore, useVisibleTask$, useContext, useSignal, noSerialize, useTask$,  type NoSerialize  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BlobReader, ZipReader, BlobWriter, TextWriter } from '@zip.js/zip.js';
import { last } from 'myrmidon';
import styles from './styles.module.css';
import FileInput from '~/components/FileInput';
import firebase from '~/firebase';
import { sessionContext } from '~/stores/session';

async function uploadFile(file, user) {
    const reader = new ZipReader(new BlobReader(file));
    const entries = await reader.getEntries({});

    if (entries.length > 0) {
        const fileEntry = entries.find(f => f.filename.includes('data.json'));

        if (!fileEntry?.getData) throw new Error('no data');
        const zipFileWriter = new TextWriter();
        const helloWorldText = await fileEntry.getData(zipFileWriter);
        const data = JSON.parse(helloWorldText);
        const imageNames = new Set(data.recipes.map(r => r.image).filter(Boolean));

        await firebase.saveUserData(
            user,
            JSON.parse(helloWorldText)
        );

        const images = entries.filter(f => imageNames.has(last(f.filename.split('/'))));

        await Promise.all(images.map(async i => {
            const imageName = last(i.filename.split('/'));
            const writer = new BlobWriter();

            if (!i.getData) return;
            const image = await i.getData(writer);

            await firebase.saveImage(user, imageName, image);
        }));
    }
}

export default component$(() => {
    const session = useContext(sessionContext);

    const file = useSignal<NoSerialize<Blob>[] | NoSerialize<File>[]>();

    if (file.value) {
        uploadFile(file.value, session.user.value);
    }

    return (
        <>
            <div class={styles.page}>
                <FileInput
                    class={styles.uploader}
                    value={file}
                    label='Click or drag and drop file'
                />
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : 'Import Recipes',
    meta  : [
        { name: 'import' }
    ]
};

