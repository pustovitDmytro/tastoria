#!/usr/bin/env node
/* eslint-disable no-param-reassign */

import path from 'path';
import { docopt } from 'docopt';
import fs from 'fs-extra';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import sectionize from 'remark-sectionize';
import { parse } from 'date-fns';

const doc = `
Usage:
    bundle <markdownFile> <jsonFile>
    bundle -h | --help

Options:
    bundle      Transform ChangeLog.md into json
`;

// [
//     {
//         "version": "1.23.0",
//         "diffUrl": "",
//         "date": "",
//         "changes": [ {
//             "type": "Fix",
//             "message": "",
//             "commitHash": "",
//             "commitURL": ""
//         } ]
//     }
// ]

function handleDate(str) {
    return parse(`${str.trim()}12:00:00`, '(yyyy-MM-dd)HH:mm:ss', new Date()).toISOString();
}

function remarkTelegraphPlugin() {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    function Compiler(tree) {
        return JSON.stringify(visit(tree));
    }

    Object.assign(this, { Compiler });
}

function handleReleaseHeading(node) {
    const result = {};

    if (node.children.length === 1) {
        const [ text ] = node.children;
        const [ version, date ] = text.value.split(/\s+/);

        result.date = handleDate(date);
        result.version = version;
    }

    if (node.children.length === 2) {
        for (const child of node.children) {
            if (child.type === 'link') {
                result.diffUrl = child.url;
                const [ text ] = child.children;

                result.version = text.value;
            }

            if (child.type === 'text') {
                result.date =  handleDate(child.value);
            }
        }
    }

    return result;
}

function extractChanges(changeSection) {
    const heading = changeSection.children.find(c => c.type === 'heading');
    const type = heading.children[0].value;

    const list = changeSection.children.find(c => c.type === 'list');
    const changes = [];

    if (!list) return changes;

    for (const listItem of list.children) {
        for (const paragraph of listItem.children) {
            const result = {
                message : '',
                type
            };

            for (const item of paragraph.children) {
                if (item.type === 'text') {
                    result.message += item.value;
                }

                if (item.type === 'link') {
                    result.commit = item.children[0].value;
                    result.commitURL = item.url;
                }
            }

            result.message = result.message.replace('()', '').trim();
            changes.push(result);
        }
    }

    return changes;
}

function handleReleaseSection(node) {
    const heading = node.children.find(c => c.type === 'heading');
    const result = handleReleaseHeading(heading);

    result.changes = [];
    const changeSections = node.children.filter(c => c.type === 'section');

    for (const changeSection of changeSections) {
        result.changes.push(
            ...extractChanges(changeSection)
        );
    }

    return result;
}

const visit = (node) => {
    const result = {};

    if (node.type === 'root') {
        return node.children.map(n => visit(n))
            .filter(Boolean);
    }

    if (node.type === 'section' && node.depth === 1) {
        return handleReleaseSection(node);
    }

    return null;
};

async function main(opts) {
    const markdownFile  = await fs.readFile(opts['<markdownFile>']);

    const content = markdownFile.toString();
    // const res = md2json.parse(fileContent.toString());
    const vFile = await unified()
        .use(sectionize)
        .use(remarkParse)
        .use(remarkTelegraphPlugin)
        .process(content);

    await fs.writeFile(
        opts['<jsonFile>'],
        vFile.value
    );

    console.log(`written to ${opts['<jsonFile>']}`);
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main(docopt(doc));
