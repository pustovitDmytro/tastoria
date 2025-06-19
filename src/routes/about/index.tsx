import { $, component$, useContext, useSignal, useStore, useVisibleTask$  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import uaparser from 'ua-parser-js';
import { format } from 'date-fns';
import { isFunction } from 'myrmidon';
import { license } from '../../../package.json';
import styles from './styles.module.css';
import { Link } from '~/components/Link';
import Image from '~/media/about.png?jsx';
import logger from '~/logger';
import GithubIcon from '~/components/Icons/github.svg';
import CopyIcon from '~/components/Icons/copy.svg';
import CloseIcon from '~/components/Icons/close.svg';
import { languages } from '~/i18n';
import { appContext } from '~/stores';
import Button from '~/components/Button';
import Page from '~/components/Page';
import Header from '~/components/Header/header';

const version = TASTORIA_BUILD.VERSION;

export const useUserAgentDetails = routeLoader$(async (requestEvent) => {
    const userAgent = requestEvent.request.headers.get('user-agent');

    return uaparser(userAgent);
});

export const useChangeLogDetails = routeLoader$(async ({ url }) => {
    try {
        const changelogUrl = new URL('/changelog.json', url.origin);
        const res = await fetch(changelogUrl.href);

        return await res.json();
    } catch (error) {
        logger.error(error);

        return [];
    }
});

interface BoxProps {
    label?: string;
    name:string;
    value?:string;
}

const InfoBox = component$<BoxProps>((props) => {
    return <div class={styles.infoBox} key={props.label + props.name}>
        {/* <span class={styles.infoLabel}>{props.label}</span> */}
        <span class={styles.infoName}>{props.name}</span>
        {props.value && <span class={styles.infoValue}>{props.value}</span>}
    </div>;
});

const Separator = component$(() => {
    return <div class={styles.separator}></div>;
});

// eslint-disable-next-line max-lines-per-function
export default component$(() => {
    const uaInfo = useUserAgentDetails();
    const changeLog = useChangeLogDetails();
    const app = useContext(appContext);
    const canBeCopied = useSignal(true);

    const deviceSize = useStore({
        availWidth  : 0,
        availHeight : 0
    });

    const deviceInfo = [ 'browser', 'engine', 'os' ]
        .filter(key => uaInfo.value[key]).map(key => {
            const name = uaInfo.value[key].name;
            const value = uaInfo.value[key].version;

            return { label: key, name, value };
        }) as BoxProps[];

    if (deviceSize.availWidth) deviceInfo.push({ name: $localize `pages.about.widthLabel`, value: deviceSize.availWidth.toFixed(0) });
    if (deviceSize.availHeight) deviceInfo.push({ name: $localize `pages.about.heightLabel`, value: deviceSize.availHeight.toFixed(0) });

    const { device, cpu } = uaInfo.value;

    if (device.vendor) deviceInfo.push({ label: $localize `pages.about.deviceLabel`, name: device.vendor, value: device.model });
    deviceInfo.push({ label: $localize `pages.about.architectureLabel`, name: cpu.architecture });

    useVisibleTask$(() => {
        deviceSize.availWidth = window.screen.availWidth;
        deviceSize.availHeight = window.screen.availHeight;
        canBeCopied.value = isFunction(navigator.clipboard.writeText);
    });

    const language = useSignal(app.language);
    const dateFnsLocale = languages.find(l => l.id === language.value)?.date;

    const handleCopyClick = $((infoMap) => {
        const message = [
            ...infoMap.map(info => {
                const line = [] as string[];

                if (info.label) line.push(info.label);
                line.push(info.name);
                if (info.value) line.push(info.value);

                return line.join(': ');
            }),
            `Version: ${version}`
        ].join('\n');

        navigator.clipboard.writeText(message);
        const toastId = 'about_deviceInfo.clipboard';

        app.toasts[toastId] = {
            id   : toastId,
            type : 'success',
            text : $localize `pages.about.deviceInfo_copied_to_clipboard`
        };
    });

    const isOpened = useStore({
        changeLog : false
    });

    const isMenuOpened = isOpened.changeLog;

    return <Page>
        <Header actions={[]} q:slot='header'></Header>
        <div q:slot='content' class={styles.page}>
            <div class={[ styles.paper, { [styles.isMenuOpened]: isMenuOpened } ]}>
                <div class={styles.header}>Tastoria</div>
                <div class={styles.content}>
                    <InfoBox name={$localize `pages.about.LicenseLabel`} value={license} />
                    <Separator/>
                        {...deviceInfo.map(info => <InfoBox
                            key={info.label}
                            label={info.label}
                            name={info.name}
                            value={info.value}
                        />)}
                </div>
                <div class={styles.footer}>
                    {
                        canBeCopied.value
                            ? <Button
                                class={styles.copyToClipboard}
                                icon={true}
                                onClick={$(() => handleCopyClick(deviceInfo))}
                            >
                                <CopyIcon/>
                            </Button>
                            : <div></div>
                    }
                    <span>v.{version}</span>
                </div>
            </div>
            <Image class={[ styles.image, { [styles.isMenuOpened]: isMenuOpened } ]}/>
            <div class={[ styles.menu, { [styles.isMenuOpened]: isMenuOpened } ]}>
                <Button class={styles.openBtn} onClick={$(() => isOpened.changeLog = true)}>{$localize `pages.about.changlelogTitle`}</Button>
            </div>
            {
                changeLog.value.length > 0
                    ? <div class={[ styles.changlelog, { [styles.isMenuOpened]: isMenuOpened } ]}>
                        <Button class={styles.closeBtn} icon={true} onClick={$(() => isOpened.changeLog = false)}>
                            <CloseIcon/>
                        </Button>
                        <h3>{$localize `pages.about.changlelogTitle`}</h3>
                {...changeLog.value.map(release => <div key={release.version} class={styles.release}>
                    <div class={styles.releaseTitle}>
                        <span class={styles.version} >{release.version}</span>
                        <span class={styles.date}>{format(release.date, 'dd MMM y', { locale: dateFnsLocale })}</span>
                        <Link class={styles.github} href={release.diffUrl}>
                            <GithubIcon/>
                        </Link>
                    </div>
                    <ul>
                        {
                            release.changes
                                .filter(c => [ 'Fix', 'New', 'Update' ].includes(c.type))
                                .map(
                                    change => <li
                                        key={change.commit}
                                        class={{ [styles[change.type]]: true }
                                        }>
                                        {change.message}
                                    </li>
                                )
                        }
                    </ul>
                </div>)}
                    </div>
                    : null
            }
        </div>
    </Page>;
});

export const head: DocumentHead = {
    title : $localize `pages.about.head_title`
};

