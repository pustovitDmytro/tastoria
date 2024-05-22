/* eslint-disable no-param-reassign */
import type { Signal, NoSerialize } from '@builder.io/qwik';
import { $, component$, useContext, useSignal  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { BlobReader, ZipReader, BlobWriter, TextWriter } from '@zip.js/zip.js';
import { last } from 'myrmidon';
import JSZip from 'jszip';
import styles from './styles.module.css';
import FileInput from '~/components/FileInput';
import firebaseUI from '~/firebase/ui';
import { sessionContext, recipesContext, appContext } from '~/stores';
import Button from '~/components/Button';
import DownloadIcon from '~/components/Icons/download.svg?component';
import { getRecipePlaceHolder } from '~/utils/recipe';
import Page from '~/components/Page';
import Progress from '~/components/Progress';
import Header from '~/components/Header/header';
import type { Recipe } from '~/types';

async function handleImport(file, user: any, recipeMap: { [x: string]: Recipe; }, progress: Signal<number>) {
    const reader = new ZipReader(new BlobReader(file));
    const entries = await reader.getEntries({});

    progress.value += 0.25;

    if (entries.length > 0) {
        const fileEntry = entries.find(f => f.filename.includes('data.json'));

        if (!fileEntry?.getData) throw new Error('no data');
        const zipFileWriter = new TextWriter();
        const fileData = await fileEntry.getData(zipFileWriter);

        progress.value += 0.2;

        const data = JSON.parse(fileData);
        const imageNames = new Set(data.recipes.map(r => r.image).filter(Boolean));
        const images = entries.filter(f => imageNames.has(last(f.filename.split('/'))));
        const progressPerImage = images.length > 0 ? (1 - progress.value - 0.1) / images.length : 0;

        await Promise.all(images.map(async i => {
            const imageName = last(i.filename.split('/'));
            const writer = new BlobWriter();

            if (!i.getData) {
                progress.value += progressPerImage;

                return;
            }

            const image = await i.getData(writer);

            progress.value += progressPerImage / 2;

            await firebaseUI.saveImage(user, imageName, image);
            progress.value += progressPerImage / 2;
        }));

        data.recipes.forEach(recipe => {
            const prepared = {
                ...getRecipePlaceHolder(),
                ...recipe
            };

            recipeMap[prepared.id] = prepared;
        });
    }

    // eslint-disable-next-line require-atomic-updates
    progress.value = 1;
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

async function exportBackup(user, recipes) {
    const zip = new JSZip();

    zip.file('data.json', JSON.stringify({ recipes }));
    for (const r of recipes) {
        if (r.image) {
            const image = await firebaseUI.downloadImage(user.id, r.image);

            zip.file(r.image, image);
        }
    }

    const blob = await zip.generateAsync({ type: 'blob' });

    saveAs(blob, `${user.fullName}.tastoria`);
}

const Export = component$(() => {
    const session = useContext(sessionContext);
    const recipes = useContext(recipesContext);
    const recipesList = Object.values(recipes.all);
    const userExportHanlder = $(() => exportBackup(session.user.value, recipesList));

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
    const recipeContext = useContext(recipesContext);
    const app = useContext(appContext);
    const progress = useSignal(0);

    if (file.value) {
        // eslint-disable-next-line promise/catch-or-return
        handleImport(file.value, session.user.value, recipeContext.all, progress)
            // eslint-disable-next-line promise/always-return, promise/prefer-await-to-then
            .then(() => {
                recipeContext.lastChanged.value = new Date();

                const toastId = 'import_completed';

                app.toasts[toastId] = {
                    id   : toastId,
                    type : 'success',
                    text : $localize `pages.import.import_completed_toast`
                };
            });
    }

    return <Page>
        <Header actions={[]} q:slot='header'></Header>
        <div  q:slot='content' class={styles.page}>
            <div class={styles.infoPage}>
                <Export/>
            </div>
            <div class={styles.importBlock}>
                <FileInput
                    class={styles.uploader}
                    value={file}
                    label={$localize `pages.import.fileInput_placeholder`}
                />
                {file.value ? <Progress value={progress}></Progress> : null}
            </div>
        </div>
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.import.head_title`
};
