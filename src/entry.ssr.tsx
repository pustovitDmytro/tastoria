import {
    renderToStream,
    type RenderToStreamOptions
} from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import Root from './root';
import { extractBase } from './i18n';

export default function (opts: RenderToStreamOptions) {
    return renderToStream(<Root />, {
        manifest,
        ...opts,
        base                : extractBase, // determine the base URL for the client code
        // Use container attributes to set attributes on the html tag.
        containerAttributes : {
            lang : opts.serverData?.locale ?? 'en-us',
            ...opts.containerAttributes
        }
    });
}
