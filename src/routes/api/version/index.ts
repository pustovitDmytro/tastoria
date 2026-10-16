import type { RequestHandler } from '@builder.io/qwik-city';
import { buildFields } from '~/utils/buildInfo';

export const onGet: RequestHandler = ({ json, url, headers }) => {
    headers.set('Cache-Control', 'no-store');
    json(200, buildFields(url.host));
};
