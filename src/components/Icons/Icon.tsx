import { component$ } from '@builder.io/qwik';
import * as icons from './index';
import logger from '~/logger';

type Props = {
    class?: string;
    name: string
};

const aliases = {
    'delete' : 'deleteIcon',
    'import' : 'importIcon'
};

export default component$((props:Props) => {
    const { name, class:classname } = props;
    const Icon = icons[name] || icons[aliases[name]];

    if (!Icon) {
        logger.error(`icon ${name} not found`);

        return;
    }


    return <Icon class={classname}/>;
});
