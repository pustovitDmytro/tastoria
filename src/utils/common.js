
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
