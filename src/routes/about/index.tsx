import { component$, useStore, useVisibleTask$  } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { routeLoader$ } from '@builder.io/qwik-city';
import uaparser from 'ua-parser-js';
import styles from './styles.module.css';
import Image from '~/media/about.png?jsx';

const version = '123';
const license = 'MIT';

export const useUserAgentDetails = routeLoader$(async (requestEvent) => {
    const userAgent = requestEvent.request.headers.get('user-agent');

    return uaparser(userAgent);
});

interface BoxProps {
    label: string;
    name:string;
    value?:string;
}

const InfoBox = component$<BoxProps>((props) => {
    return <div class={styles.infoBox} key={props.label}>
        {/* <span class={styles.infoLabel}>{props.label}</span> */}
        <span class={styles.infoName}>{props.name}</span>
        <span class={styles.infoValue}>{props.value}</span>
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
        });

    if (deviceSize.availWidth) deviceInfo.push({ label: 'width', name: 'width', value: deviceSize.availWidth });
    if (deviceSize.availHeight) deviceInfo.push({ label: 'height', name: 'height', value: deviceSize.availHeight });

    const { device, cpu } = result.value;

    if (device.vendor) deviceInfo.push({ label: 'device', name: device.vendor, value: device.model });
    deviceInfo.push({ label: 'architecture', name: cpu.architecture, value: null });


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
                        <InfoBox label='licence' name='License' value={license} />
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
    title : 'About'
};

