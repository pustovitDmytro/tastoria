#!/usr/bin/env node

import {docopt} from 'docopt';
import path from 'path';
import fs from 'fs-extra';
import unzipper from 'unzipper';
import xmlJS from 'xml-js'
import {v4 as uuid} from 'uuid'
import {toArray} from 'myrmidon'

const tmpDirectory = path.resolve('tmp')

const doc = `
Usage:
   convert <from> [--directory <directory> | -d <directory>]
   convert -h | --help
 
Options:
    <from>                                  File to convert
   -d <directory> | --directory <directory> Out directory [default: ${tmpDirectory}]
`

async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const data = [];

      stream.on('data', (chunk) => {
        data.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(data))
      })

      stream.on('error', (err) => {
        reject(err)
      })
   
    })
  }


class CookMateParser {
    constructor(file){
        this._input = file;
    }
    parse = async(directory) => {
        this.savePath = path.resolve(directory);
        this.imagesPath = path.join(this.savePath, 'images');
        
        await fs.remove(this.imagesPath);
        await fs.ensureDir(this.imagesPath);
        
        this._items = [];
        this._images = new Map();
        await new Promise((resolve, reject)=>{
            const parser = this;
            fs.createReadStream(this._input)
                .pipe(unzipper.Parse())
                .on('error',reject)
                .on('finish',resolve)
                .on('entry', async function(entry) {
                  const fileName = entry.path;
                  if(path.extname(fileName)==='.xml') {
                        parser.handleXML(
                            await streamToBuffer(entry)
                        );
                        return;
                  }
    
                  if(path.extname(fileName)==='.jpg') {
                        parser.handleImage(entry)
                        return;
                    }
    
                    entry.autodrain();
                });
        });

        await fs.writeJSON(
            path.join(this.savePath, 'data.json'),
            {recipes: this._items}
        )

        return {
            recipes: this._items.length,
            images: this._images.size
        }
    }

    handleImage(stream){
        const name = uuid() + path.extname(stream.path);
        stream.pipe(fs.createWriteStream(
            path.join(this.imagesPath, name)
        ));
        this._images.set(
            path.basename(stream.path), 
            name
        )
    }

    handleXML(raw){
        const res = xmlJS.xml2js(raw, {compact: true});
        for (const recipe of res.cookbook.recipe){
            // console.log('recipe: ', recipe);
            const data = {
                title: recipe.title._text,
                description: recipe.description._text,
                ingredients: [],
                steps: [],
                url: recipe.url._text,
                image: null,
                categories: toArray(recipe.category).map(t=>t._text),
                tags: toArray(recipe.tag).map(t=>t._text),
                time: {
                    total: recipe.totaltime._text,
                    prepare: recipe.preptime._text,
                    cook: recipe.cooktime._text
                }
            };
            
            if(recipe.imagepath._text){
                data.image = this._images.get(path.basename(recipe.imagepath._text))
            }
    
            this._items.push(data)
        }
    }
}


async function main(opts){
    console.log(opts);
    const parser = new CookMateParser(opts['<from>']);
    const stats = await parser.parse(tmpDirectory)
    console.log('stats: ', stats);
}

main(docopt(doc));