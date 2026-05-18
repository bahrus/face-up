// @ts-check
/** @import {Merges} from './types/roundabout/types.d.ts' */

/**
 * @typedef {object} FaceUpForwardingProps
 * @property {string | File | FormData | null} value
 * @property {string | File | FormData | null} state
 * @property {boolean} disabled
 * @property {boolean} required
 * @property {string} validationMessage
 */

/**
 * Property key constants for FaceUp-relevant forwarding.
 * @type {{ [K in keyof FaceUpForwardingProps]: K }}
 */
export const props = {
    value: 'value',
    state: 'state',
    disabled: 'disabled',
    required: 'required',
    validationMessage: 'validationMessage',
};

/**
 * Merges configuration for forwarding properties from the host view model
 * to the faceUp feature instance via roundabout's reactive system.
 *
 * When any of these properties change on the view model, the corresponding
 * setter on `el.faceUp` fires, which syncs to ElementInternals automatically.
 *
 * Usage in a consumer's cef.mjs:
 * ```js
 * import { faceUpMerges } from 'face-up/RAConfig.mjs';
 *
 * export const raConfig = {
 *     // ...your other config...
 *     merges: [
 *         ...faceUpMerges,
 *         // ...your other merges...
 *     ]
 * };
 * ```
 *
 * @type {Merges<FaceUpForwardingProps>}
 */
export const faceUpMerges = [
    {
        ifKeyIn: [props.value],
        assign: {
            '?.faceUp?.value': '?.value'
        }
    },
    {
        ifKeyIn: [props.state],
        assign: {
            '?.faceUp?.state': '?.state'
        }
    },
    {
        ifKeyIn: [props.disabled],
        assign: {
            '?.faceUp?.disabled': '?.disabled'
        }
    },
    {
        ifKeyIn: [props.required],
        assign: {
            '?.faceUp?.required': '?.required'
        }
    },
    {
        ifKeyIn: [props.validationMessage],
        assign: {
            '?.faceUp?.validationMessage': '?.validationMessage'
        }
    },
];
