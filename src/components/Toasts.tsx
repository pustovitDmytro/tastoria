import {
    $,
    component$,
    Slot,
    useContext,
    useSignal,
    useVisibleTask$
} from '@builder.io/qwik';
import type {
    ClassList
} from '@builder.io/qwik';
import { isAfter, add } from 'date-fns';
import styles from './Toasts.module.scss';
import { appContext } from '~/stores';
import FailureIcon from '~/components/Icons/failure.svg';
import SuccessIcon from '~/components/Icons/success.svg';

type ToastProps = {
  class?: ClassList | ClassList[];
};

export default component$((props: ToastProps) => {
    const app = useContext(appContext);

    useVisibleTask$(({ cleanup, track }) => {
        const time = new Date();
        const tracked = track(() => Object.keys(app.toasts));

        for (const toast of Object.values(app.toasts)) {
            if (!toast.time) toast.time = time;
        }

        const timeout = setTimeout(() => {
            const toRemove = Object.values(app.toasts).filter(t => t.time && isAfter(
                new Date(),
                add(t.time, { seconds: 10 })
            ));

            for (const toast of toRemove) {
                delete app.toasts[toast.id];
            }
        }, 10_000);

        cleanup(() => clearTimeout(timeout));
    });

    const handleClick = $((toast) => {
        delete app.toasts[toast.id];
    });

    const toasts = Object.values(app.toasts);

    return <div class={[ styles.container, props.class ]}>
        {
            toasts.map(toast => <div
                key={toast.id}
                class={[ styles.toast, styles[toast.type] ]}
                onClick$={() => handleClick(toast)}
            >
                <div class={styles.icon}>
                    {
                        toast.type === 'error'
                            ? <FailureIcon/>
                            : <SuccessIcon/>
                    }
                </div>
                <span class={styles.text}>
                    {toast.text}
                </span>
            </div>)
        }
    </div>;
});
