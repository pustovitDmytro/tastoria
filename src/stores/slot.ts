import type { JSXNode, JSXOutput } from '@builder.io/qwik';
import { createContextId } from '@builder.io/qwik';

export interface SlotState {
    header: JSXNode | null | JSXOutput;
    contextMenu: JSXNode | null;
}

export default createContextId<SlotState>('Slot');
