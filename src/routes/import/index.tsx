/* eslint-disable no-param-reassign */
import { $, component$, useStore, useVisibleTask$, useContext, useSignal, noSerialize, useTask$,  type NoSerialize  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BlobReader, ZipReader, BlobWriter, TextWriter } from '@zip.js/zip.js';
import { last } from 'myrmidon';
import JSZip from 'jszip';
import styles from './styles.module.css';
import FileInput from '~/components/FileInput';
import firebase from '~/firebase';
import { sessionContext } from '~/stores';
import Button from '~/components/Button';
import DownloadIcon from '~/components/Icons/download.svg?component';
import Loader from '~/components/Loader.js';

async function uploadFile(file, user) {
    const reader = new ZipReader(new BlobReader(file));
    const entries = await reader.getEntries({});

    if (entries.length > 0) {
        const fileEntry = entries.find(f => f.filename.includes('data.json'));

        if (!fileEntry?.getData) throw new Error('no data');
        const zipFileWriter = new TextWriter();
        const fileData = await fileEntry.getData(zipFileWriter);
        const data = JSON.parse(fileData);
        const imageNames = new Set(data.recipes.map(r => r.image).filter(Boolean));

        await firebase.saveUserData(user, data);

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

function click(node) {
    try {
        node.dispatchEvent(new MouseEvent('click'));
    } catch {
        const evt = document.createEvent('MouseEvents');

        evt.initMouseEvent(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            80,
            20,
            false,
            false,
            false,
            false,
            0,
            null
        );
        node.dispatchEvent(evt);
    }
}

function saveAs(blob, name) {
    const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as any;

    name = name || blob.name || 'download';
    a.download = name;
    a.rel = 'noopener'; // tabnabbing

    a.href = URL.createObjectURL(blob);
    setTimeout(() => {
        URL.revokeObjectURL(a.href);
    }, 4e4); // 40s
    setTimeout(() => {
        click(a);
    }, 0);
}

async function exportBackup(user) {
    const recipes = await firebase.downloadRecipes(user.id);
    const zip = new JSZip();

    zip.file('data.json', JSON.stringify({ recipes }));
    for (const r of recipes) {
        if (r.image) {
            const image = await firebase.downloadImage(user.id, r.image);

            zip.file(r.image, image);
        }
    }

    const blob = await zip.generateAsync({ type: 'blob' });

    saveAs(blob, `${user.fullName}.tastoria`);
}

const Export = component$(() => {
    const session = useContext(sessionContext);
    const userExportHanlder = $(() => exportBackup(session.user.value));

    return <div class={styles.exportBox}>
        <span class={styles.exportText}>{$localize `pages.import.export_placeholder`}</span>

        <Button class={[ styles.exportButton ]} onClick={userExportHanlder}>
            <DownloadIcon class={[ styles.icon ]}/>
        </Button>
    </div>;
});


export default component$(() => {
    const session = useContext(sessionContext);
    const file = useSignal<NoSerialize<Blob>[] | NoSerialize<File>[]>();

    if (file.value) {
        uploadFile(file.value, session.user.value);
    }

    return (
        <>
            <div class={styles.page}>
                <div class={styles.infoPage}>
                    <Export/>
                </div>
                <FileInput
                    class={styles.uploader}
                    value={file}
                    label={$localize `pages.import.fileInput_placeholder`}
                />
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.import.head_title`
};

