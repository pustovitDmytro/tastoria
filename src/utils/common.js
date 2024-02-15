
export function toNumber(cipher, alphabet) {
    let result = BigInt(0);

    [ ...cipher ]
        .map(s => alphabet.indexOf(s))
        .forEach((n, index) => {
            const power = BigInt(cipher.length - index - 1);

            result += BigInt(n) * BigInt(BigInt(alphabet.length) ** power);
        });

    return result;
}


export function uuidToNumber(uuid) {
    const alphabet = [ ...'abcdef', ...'0123456789' ];
    const module = Number.MAX_SAFE_INTEGER;
    const n = toNumber(uuid.replaceAll('-', '').toLowerCase(), alphabet);

    return Number(n % BigInt(module));
}
