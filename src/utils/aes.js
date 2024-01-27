import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

const IV_LENGTH = 16;
const HEX_MULTIPLIER = 2;
const IV_STRING_LENGTH = HEX_MULTIPLIER * IV_LENGTH;

function pad(num, size) {
    const zeros = (Array.from({ length: size })).fill('0').join('');

    return (`${zeros}${num}`).slice(-size);
}

class AES {
    constructor({ key }) {
        this.algorithm = 'aes-256-gcm';
        this.key = new TextEncoder().encode(key);
    }

    async encrypt(text) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const encodedText = new TextEncoder().encode(text);
        const subtleCrypto = crypto.webcrypto.subtle;
        const cipher = await subtleCrypto.encrypt(
            {
                name : 'AES-GCM',
                iv
            },
            await subtleCrypto.importKey('raw', this.key, 'AES-GCM', false, [ 'encrypt' ]),
            encodedText
        );

        // Combine the encrypted data and IV for later decryption
        const encryptedBytes = new Uint8Array(cipher);
        const result = new Uint8Array(encryptedBytes.length + iv.length);

        const ivString = Buffer.from(iv).toString('base64');
        const encryptedString = Buffer.from(encryptedBytes).toString('base64');

        return `${ivString}.${encryptedString}`;
    }

    async decrypt(text) {
        const [ ivString, encryptedString ] = text.split('.');
        const iv = Buffer.from(ivString, 'base64');

        const encryptedBytes = Buffer.from(encryptedString, 'base64');
        const subtleCrypto = crypto.webcrypto.subtle;
        const key = await subtleCrypto.importKey('raw', this.key, 'AES-GCM', false, [ 'decrypt' ]);
        const decrypted = await subtleCrypto.decrypt(
            {
                name : 'AES-GCM',
                iv
            },
            key,
            encryptedBytes
        );

        return new TextDecoder().decode(decrypted);
    }
}

// class AES {
//     constructor({ algorithm, key }) {
//         this.algorithm = algorithm;
//         this.key = key;
//     }

//     encrypt(text) {
//         const iv = crypto.randomBytes(IV_LENGTH);
//         const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

//         let crypted = cipher.update(text, 'utf8', 'hex');

//         crypted += cipher.final('hex');
//         const ivString = iv.toString('hex');

//         return `${ivString}.${crypted}`;
//     }

//     decrypt(text) {
//         const [ iv, encrypted ] = text.split('.');
//         const ivString = pad(iv, IV_STRING_LENGTH);
//         const vec = new Buffer.from(ivString, 'hex');
//         const decipher = crypto.createDecipheriv(this.algorithm, this.key, vec);

//         let dec = decipher.update(encrypted, 'hex', 'utf8');

//         dec += decipher.final('utf8');

//         return dec;
//     }
// }

function toNumber(cipher, alphabet) {
    let result = BigInt(0);

    [ ...cipher ]
        .map(s => alphabet.indexOf(s))
        .forEach((n, index) => {
            const power = BigInt(cipher.length - index - 1);

            result += BigInt(n) * BigInt(BigInt(alphabet.length) ** power);
        });

    return result;
}

function toSymbols(num, alphabet) {
    const base = BigInt(alphabet.length);
    const remainder = num % base;
    const quotient = (num - remainder) / base;
    const symbol = alphabet[remainder];

    return quotient === BigInt(0)
        ? [ symbol ]
        : [ ...toSymbols(quotient, alphabet), symbol ];
}


/* eslint-disable no-secrets/no-secrets*/
export default class Cipher extends AES {
    outAlphabet = [
        ...'abcdefghijklmnopqrstuvwxyz',
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ...'0123456789'
    ];

    inAlphabet = [
        ...'abcdefghijklmnopqrstuvwxyz',
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ...'0123456789',
        ...'=/+.'
    ];

    async encrypt(payload) {
        const string = JSON.stringify(payload);
        const encrypted = await super.encrypt(string);

        return this.short(encrypted);
    }

    async decrypt(text) {
        const long = this.long(text);
        const decrypted = await super.decrypt(long);

        return JSON.parse(decrypted);
    }

    short(hex) {
        return toSymbols(toNumber(hex, this.inAlphabet), this.outAlphabet).join('');
    }

    long(text) {
        return toSymbols(toNumber(text, this.outAlphabet), this.inAlphabet).join('');
    }
}

