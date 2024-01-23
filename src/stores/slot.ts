import type { JSXNode } from '@builder.io/qwik';
import { createContextId } from '@builder.io/qwik';

export interface SlotState {
    header: JSXNode | null;
    contextMenu: JSXNode | null;
}

export default createContextId<SlotState>('Slot');
