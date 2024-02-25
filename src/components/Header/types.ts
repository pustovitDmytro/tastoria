import type { NoSerialize, QRL, Signal } from '@builder.io/qwik';

export type HeaderAction = {
    disabled?: Signal<boolean>
    visible?: Signal<boolean>
    handler?:NoSerialize<() => any> | QRL<() => void>
    link?: string
    icon: string
    caption: string
    successToast?:string
}
