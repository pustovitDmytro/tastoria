import { component$, Slot } from '@builder.io/qwik';
import type { QwikIntrinsicElements } from '@builder.io/qwik';

type LinkProps = QwikIntrinsicElements['a'];

export const Link = component$<LinkProps>(({ href, ...props }) => {
    return (
        <a href={href} {...props}>
            <Slot />
        </a>
    );
});
