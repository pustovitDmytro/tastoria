#!/usr/bin/env node
/* eslint-disable no-param-reassign */

import path from 'path';
import { docopt } from 'docopt';
import fs from 'fs-extra';
import { v4 as uuid } from 'uuid';
import { toArray } from 'myrmidon';
import Papa from 'papaparse';
import pkg from '../package.json' assert { type: 'json' };

const directory = path.resolve('src/locales');
const csvFile = path.resolve(directory, 'locales.csv');

const doc = `
Usage:
    localization json_to_csv
    localization csv_to_json
    localization -h | --help

Options:
    json_to_csv     combine json files to csv
    csv_to_json     split csv file to language json files
`;

async function jsonToCSV() {
    const translationFiles = await fs.readdir(directory);
    const jsonFiles = translationFiles.filter(f => f.includes('.json'));

    const translations =  await Promise.all(
        jsonFiles.map(f => fs.readJSON(path.join(directory, f)))
    );

    const texts = [];

    for (const t of translations) {
        const lang = t.locale;

        Object.keys(t.translations).forEach(id => {
            const curr = texts.find(tt => tt.id === id);

            if (!curr) {
                const item = { id };

                translations.forEach(tt => item[tt.locale] = '');
                texts.push({
                    ...item,
                    [lang] :
                    t.translations[id]
                });

                return;
            }

            curr[lang] = t.translations[id];
        });
    }

    const csv = Papa.unparse(texts);

    await fs.writeFile(
        csvFile,
        csv
    );

    console.log(`written to ${csvFile}`);
}

async function csvToJSON() {
    const csvContent = await fs.readFile(csvFile);

    const parsed = Papa.parse(csvContent.toString(), { header: true });
    const texts = parsed.data;
    const locales = parsed.meta.fields.filter(f => ![ 'id', 'key' ].includes(f));

    await Promise.all(
        locales.map(async l => {
            const content = {
                'locale'       : l,
                'translations' : {}
            };

            for (const t of texts) {
                content.translations[t.id] = t[l];
            }

            const file = path.join(directory, `message.${l}.json`);

            await fs.writeJSON(file, content);
            console.log(`Written ${file}`);
        })
    );
}

async function main(opts) {
    if (opts.json_to_csv) {
        await jsonToCSV();
    }

    if (opts.csv_to_json) {
        await csvToJSON();
    }
}

main(docopt(doc));
