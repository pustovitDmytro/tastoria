#!/usr/bin/env node
/* eslint-disable no-param-reassign */

import path from 'path';
import { docopt } from 'docopt';
import fs from 'fs-extra';
import unzipper from 'unzipper';
import xmlJS from 'xml-js';
import { v4 as uuid } from 'uuid';
import { toArray } from 'myrmidon';
import pkg from '../package.json' assert { type: 'json' };

const tmpDirectory = path.resolve('tmp');

const doc = `
Usage:
   convert <from> [--directory <directory> | -d <directory>]
   convert -h | --help

Options:
    <from>                                  File to convert
   -d <directory> | --directory <directory> Out directory [default: ${tmpDirectory}]
`;

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const data = [];

        stream.on('data', (chunk) => {
            data.push(chunk);
        });

        stream.on('end', () => {
            resolve(Buffer.concat(data));
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}


class CookMateParser {
    constructor(file) {
        this._input = file;
        this._date = new Date();
    }

    parse = async (directory) => {
        this.savePath = path.resolve(directory);
        this.imagesPath = path.join(this.savePath, 'images');
        this.dataPath = path.join(this.savePath, 'data.json');

        const isExists = await fs.exists(this.dataPath);

        await fs.ensureDir(this.imagesPath);

        this._items = [];
        this._images = new Map();
        if (isExists) {
            const data = await fs.readJSON(this.dataPath);

            this._items.push(...data.recipes);
        }


        await new Promise((resolve, reject) => {
            const parser = this;

            fs.createReadStream(this._input)
                .pipe(unzipper.Parse())
                .on('error', reject)
                .on('finish', resolve)
                .on('entry', async (entry) => {
                    const fileName = entry.path;

                    if (path.extname(fileName) === '.xml') {
                        parser.handleXML(
                            await streamToBuffer(entry)
                        );

                        return;
                    }

                    // if (path.extname(fileName) === '.jpg') {
                    //     parser.handleImage(entry);

                    //     return;
                    // }

                    entry.autodrain();
                });
        });

        await fs.writeJSON(
            path.join(this.savePath, 'data.json'),
            { recipes: this._items }
        );

        return {
            recipes : this._items.length,
            images  : this._images.size
        };
    };

    handleImage(stream) {
        const name = uuid() + path.extname(stream.path);

        stream.pipe(fs.createWriteStream(
            path.join(this.imagesPath, name)
        ));
        this._images.set(
            path.basename(stream.path),
            name
        );
    }

    isEqual(a, b) {
        if (a.id && a.id === b.id) return true;
        if (a.url && a.url === b.url) return true;

        return a.title === b.title;
    }

    merge(oldRecipy, newRecipy) {
        if (oldRecipy.image) newRecipy.image = oldRecipy.image;
        Object.keys(newRecipy).forEach(key => {
            if (newRecipy[key] && newRecipy[key] !== oldRecipy[key]) {
                oldRecipy[key] = newRecipy[key];
            }
        });
    }

    parseList(xmlList) {
        if (xmlList.li) return xmlList.li.map(l => l._text).filter(Boolean);
        if (xmlList._text) {
            if (!xmlList._text.includes('<ul>')) return [ xmlList._text ];

            const res = xmlJS.xml2js(xmlList._text, { compact: true });

            return res.ul.li.map(l => l._text).filter(Boolean);
        }

        return [];
    }

    handleXML(raw) {
        const res = xmlJS.xml2js(raw, { compact: true });

        for (const recipe of res.cookbook.recipe) {
            const data = {
                id          : uuid(),
                title       : recipe.title._text,
                description : recipe.description._text,
                ingredients : this.parseList(recipe.ingredient),
                steps       : this.parseList(recipe.recipetext),
                url         : recipe.url._text,
                image       : null,
                categories  : toArray(recipe.category).map(t => t._text),
                tags        : toArray(recipe.tag).map(t => t._text),
                time        : {
                    total   : recipe.totaltime._text,
                    prepare : recipe.preptime._text,
                    cook    : recipe.cooktime._text
                },
                quantity  : recipe.quantity._text,
                comment   : recipe.comments._text,
                language  : recipe.lang._text,
                version   : pkg.version,
                createdAt : this._date.toISOString()
            };

            if (recipe.imagepath._text) {
                data.image = this._images.get(path.basename(recipe.imagepath._text));
            }

            const currentRecipy = this._items.find(i => this.isEqual(data, i));

            if (currentRecipy) {
                this.merge(currentRecipy, data);
            } else {
                this._items.push(data);
            }
        }
    }
}


async function main(opts) {
    const parser = new CookMateParser(opts['<from>']);
    const stats = await parser.parse(opts['--directory']);

    console.log('stats:', stats);
}

main(docopt(doc));
