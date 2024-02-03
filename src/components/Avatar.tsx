/* eslint-disable max-lines-per-function */
import { $, component$,  useSignal,  useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeAction$,  useLocation } from '@builder.io/qwik-city';
import styles from './Avatar.module.css';

interface AvatarProps {
    seed: number,
    class?: string
}

class LGG {
    last: number;

    constructor(seed) {
        this.last = seed * this.modulus;
    }

    // ZX81
    multiplier = 75;

    increment = 74;

    modulus = 65_537;

    next() {
        this.last = (this.multiplier * this.last + this.increment) % this.modulus;

        return this.last / this.modulus;
    }
}

function fromRange(rand, min, max) {
    return rand * (max - min) + min;
}

function prepareData(seed) {
    const lgg = new LGG(seed);

    const data = {
        eyeSpread   : fromRange(lgg.next(), -2, 4),
        mouthSpread : fromRange(lgg.next(), -1, 3),
        isMouthOpen : lgg.next() < 0.5,

        faceRotate        : fromRange(lgg.next(), -10, 10),
        faceTranslateX    : fromRange(lgg.next(), -4, 4),
        wrapperTranslateX : fromRange(lgg.next(), -4, 4),
        wrapperRotate     : fromRange(lgg.next(), 30, 60),

        faceTranslateY    : fromRange(lgg.next(), 2, 8),
        wrapperTranslateY : fromRange(lgg.next(), 0, 7),

        wrapperScale : fromRange(lgg.next(), 1, 1.5)
    };

    const isFaceLeft = lgg.next() < 0.25;
    const isFaceRight = !isFaceLeft && lgg.next() < (1 / 3);

    if (isFaceLeft) {
        data.faceTranslateX = fromRange(lgg.next(), -7, 2);
        data.wrapperRotate = fromRange(lgg.next(), 30, 90);
        data.wrapperTranslateX = fromRange(lgg.next(), -7, 2);
    }

    if (isFaceRight) {
        data.faceTranslateX = fromRange(lgg.next(), -2, 7);
        data.wrapperRotate = fromRange(lgg.next(), 0, 60);
        data.wrapperTranslateX = fromRange(lgg.next(), -2, 7);
    }

    return data;
}

export default component$<AvatarProps>((props) => {
    const { seed } = props;
    const data = prepareData(seed);
    const size = 36;

    const mouth = data.isMouthOpen ? (
        <path
            d={`M13,${19 + data.mouthSpread  } a1,0.75 0 0,0 10,0`}
            class={styles.face}
        />
    ) : (
        <path
            d={`M15 ${19 + data.mouthSpread  } c2 1 4 1 6 0`}
            class={styles.face}
            stroke-width={1.5}
            fill='none'
            stroke-linecap='round'
        />
    );

    const maskID = `avatar_${seed}`;

    return (
        <svg  viewBox={`0 0 ${size} ${size}`}
            fill='none'
            role='img'
            xmlns='http://www.w3.org/2000/svg'
            class={[ styles.avatar, props.class ]}
        >
            <mask
                id={maskID}
                maskUnits='userSpaceOnUse'
                x={0}
                y={0}
                width={size}
                height={size}
            >
                <rect width={size} height={size} rx={size * 2} fill='#FFFFFF' />
            </mask>
            <g mask={`url(#${maskID})`}>
                <rect width={size} height={size} class={styles.hat}/>
                <rect
                    x='0'
                    y='0'
                    width={size}
                    height={size}
                    transform={
                        `translate(${data.wrapperTranslateX} ${data.wrapperTranslateY}) 
                        rotate(${data.wrapperRotate} ${size / 2} ${    size / 2}) 
                        scale(${data.wrapperScale})`
                    }
                    class ={styles.head}
                    rx={size}
                />

                <g
                    transform={
                        `translate(${data.faceTranslateX} ${data.faceTranslateY}) 
                        rotate(${data.faceRotate} ${size / 2} ${size / 2})`
                    }
                >
                    {mouth}
                    <rect
                        x={14 - data.eyeSpread}
                        y={14}
                        width={2}
                        height={2.5}
                        rx={1}
                        stroke='none'
                        class={styles.face}
                    />
                    <rect
                        x={20 + data.eyeSpread}
                        y={14}
                        width={2}
                        height={2.5}
                        rx={1}
                        stroke='none'
                        class={styles.face}
                    />
                </g>
            </g>
        </svg>
    );
});
