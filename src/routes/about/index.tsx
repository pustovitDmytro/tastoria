import { component$, useStore, useVisibleTask$  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import uaparser from 'ua-parser-js';
import { license } from '../../../package.json';
import styles from './styles.module.css';
import Image from '~/media/about.png?jsx';

const version = TASTORIA_BUILD.VERSION;

export const useUserAgentDetails = routeLoader$(async (requestEvent) => {
    const userAgent = requestEvent.request.headers.get('user-agent');

    return uaparser(userAgent);
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

export default component$(() => {
    const result = useUserAgentDetails();
    const deviceSize = useStore({
        availWidth  : 0,
        availHeight : 0
    });

    const deviceInfo = [ 'browser', 'engine', 'os' ]
        .filter(key => result.value[key]).map(key => {
            const name = result.value[key].name;
            const value = result.value[key].version;

            return { label: key, name, value };
        }) as BoxProps[];

    if (deviceSize.availWidth) deviceInfo.push({ name: $localize `pages.about.widthLabel`, value: deviceSize.availWidth.toFixed(0) });
    if (deviceSize.availHeight) deviceInfo.push({ name: $localize `pages.about.heightLabel`, value: deviceSize.availHeight.toFixed(0) });

    const { device, cpu } = result.value;

    if (device.vendor) deviceInfo.push({ label: $localize `pages.about.deviceLabel`, name: device.vendor, value: device.model });
    deviceInfo.push({ label: $localize `pages.about.architectureLabel`, name: cpu.architecture });

    useVisibleTask$(() => {
        deviceSize.availWidth = window.screen.availWidth;
        deviceSize.availHeight = window.screen.availHeight;
    });

    return (
        <>
            <div class={styles.page}>
                <div class={styles.paper}>
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
                    <div class={styles.footer}>v.{version}</div>
                </div>
                <Image class={styles.image}/>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title : $localize `pages.about.head_title`
};

